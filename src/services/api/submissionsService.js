import { toast } from "react-toastify";

class SubmissionsService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'submission_c';
    this.readingsTableName = 'reading_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "day_key_c" } },
          { field: { Name: "submitted_at_c" } },
          { field: { Name: "position_c" } },
          { field: { Name: "arm_c" } },
          { field: { Name: "checklist_c" } },
          { field: { Name: "note_c" } },
          { field: { Name: "avg_sys_c" } },
          { field: { Name: "avg_dia_c" } },
          { field: { Name: "avg_pulse_c" } }
        ],
        orderBy: [
          {
            fieldName: "day_key_c",
            sorttype: "DESC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Get readings for each submission
      const submissionsWithReadings = await Promise.all(
        response.data.map(async (submission) => {
          const readings = await this.getReadingsForSubmission(submission.Id);
          return {
            ...submission,
            readings: readings || []
          };
        })
      );

      return submissionsWithReadings;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching submissions:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return [];
    }
  }

  async getReadingsForSubmission(submissionId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "sequence_c" } },
          { field: { Name: "systolic_c" } },
          { field: { Name: "diastolic_c" } },
          { field: { Name: "pulse_c" } },
          { field: { Name: "include_in_average_c" } }
        ],
        where: [
          {
            FieldName: "submission_c",
            Operator: "EqualTo",
            Values: [submissionId]
          }
        ],
        orderBy: [
          {
            fieldName: "sequence_c",
            sorttype: "ASC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.readingsTableName, params);
      
      if (!response.success) {
        return [];
      }

      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "day_key_c" } },
          { field: { Name: "submitted_at_c" } },
          { field: { Name: "position_c" } },
          { field: { Name: "arm_c" } },
          { field: { Name: "checklist_c" } },
          { field: { Name: "note_c" } },
          { field: { Name: "avg_sys_c" } },
          { field: { Name: "avg_dia_c" } },
          { field: { Name: "avg_pulse_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response || !response.data) {
        return null;
      }

      const readings = await this.getReadingsForSubmission(id);
      
      return {
        ...response.data,
        readings: readings || []
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching submission with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  }

  async create(submissionData) {
    try {
      const submissionPayload = {
        records: [
          {
            Name: submissionData.Name || `Reading ${submissionData.day_key_c}`,
            Tags: submissionData.Tags?.join(',') || '',
            day_key_c: submissionData.day_key_c,
            submitted_at_c: submissionData.submitted_at_c,
            position_c: submissionData.position_c,
            arm_c: submissionData.arm_c,
            checklist_c: submissionData.checklist_c?.join(',') || '',
            note_c: submissionData.note_c || '',
            avg_sys_c: submissionData.avg_sys_c,
            avg_dia_c: submissionData.avg_dia_c,
            avg_pulse_c: submissionData.avg_pulse_c
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, submissionPayload);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create submission ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          const submission = successfulRecords[0].data;
          
          // Create readings if provided
          if (submissionData.readings && submissionData.readings.length > 0) {
            await this.createReadings(submission.Id, submissionData.readings);
          }
          
          return submission;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating submission:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  }

  async createReadings(submissionId, readings) {
    try {
      const readingsPayload = {
        records: readings.map(reading => ({
          Name: `Reading ${reading.sequence_c}`,
          sequence_c: reading.sequence_c,
          systolic_c: reading.systolic_c,
          diastolic_c: reading.diastolic_c,
          pulse_c: reading.pulse_c,
          include_in_average_c: reading.include_in_average_c !== false,
          submission_c: submissionId
        }))
      };

      const response = await this.apperClient.createRecord(this.readingsTableName, readingsPayload);
      
      if (!response.success) {
        console.error("Error creating readings:", response.message);
        return [];
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.map(result => result.data);
      }

      return [];
    } catch (error) {
      console.error("Error creating readings:", error);
      return [];
    }
  }

  async update(id, submissionData) {
    try {
      const submissionPayload = {
        records: [
          {
            Id: parseInt(id),
            Name: submissionData.Name || `Reading ${submissionData.day_key_c}`,
            Tags: submissionData.Tags?.join(',') || '',
            day_key_c: submissionData.day_key_c,
            submitted_at_c: submissionData.submitted_at_c,
            position_c: submissionData.position_c,
            arm_c: submissionData.arm_c,
            checklist_c: submissionData.checklist_c?.join(',') || '',
            note_c: submissionData.note_c || '',
            avg_sys_c: submissionData.avg_sys_c,
            avg_dia_c: submissionData.avg_dia_c,
            avg_pulse_c: submissionData.avg_pulse_c
          }
        ]
      };

      const response = await this.apperClient.updateRecord(this.tableName, submissionPayload);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update submission ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          const submission = successfulUpdates[0].data;
          
          // Update readings if provided
          if (submissionData.readings) {
            await this.updateReadings(parseInt(id), submissionData.readings);
          }
          
          return submission;
        }
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating submission:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  }

  async updateReadings(submissionId, readings) {
    try {
      // First, delete existing readings
      const existingReadings = await this.getReadingsForSubmission(submissionId);
      if (existingReadings.length > 0) {
        const deleteParams = {
          RecordIds: existingReadings.map(r => r.Id)
        };
        await this.apperClient.deleteRecord(this.readingsTableName, deleteParams);
      }
      
      // Then create new readings
      await this.createReadings(submissionId, readings);
    } catch (error) {
      console.error("Error updating readings:", error);
    }
  }

  async delete(id) {
    try {
      // First delete associated readings
      const existingReadings = await this.getReadingsForSubmission(parseInt(id));
      if (existingReadings.length > 0) {
        const deleteReadingsParams = {
          RecordIds: existingReadings.map(r => r.Id)
        };
        await this.apperClient.deleteRecord(this.readingsTableName, deleteReadingsParams);
      }
      
      // Then delete submission
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete submission ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successfulDeletions.length > 0;
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting submission:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return false;
    }
  }

  async getByDateRange(startDate, endDate) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "day_key_c" } },
          { field: { Name: "submitted_at_c" } },
          { field: { Name: "position_c" } },
          { field: { Name: "arm_c" } },
          { field: { Name: "checklist_c" } },
          { field: { Name: "note_c" } },
          { field: { Name: "avg_sys_c" } },
          { field: { Name: "avg_dia_c" } },
          { field: { Name: "avg_pulse_c" } }
        ],
        where: [
          {
            FieldName: "day_key_c",
            Operator: "GreaterThanOrEqualTo",
            Values: [startDate]
          },
          {
            FieldName: "day_key_c",
            Operator: "LessThanOrEqualTo", 
            Values: [endDate]
          }
        ],
        orderBy: [
          {
            fieldName: "day_key_c",
            sorttype: "ASC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        return [];
      }

      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  async getDailySummaries() {
    try {
      const submissions = await this.getAll();
      
      return submissions.map(submission => ({
        day_key_c: submission.day_key_c,
        avg_sys_c: submission.avg_sys_c,
        avg_dia_c: submission.avg_dia_c,
        avg_pulse_c: submission.avg_pulse_c,
        exceededThreshold: submission.avg_sys_c >= 180 || submission.avg_dia_c >= 110
      }));
    } catch (error) {
      return [];
    }
  }
}

export const submissionsService = new SubmissionsService();