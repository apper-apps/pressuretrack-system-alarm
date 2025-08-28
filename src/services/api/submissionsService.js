import submissionsData from "@/services/mockData/submissions.json";

class SubmissionsService {
  constructor() {
    this.data = [...submissionsData];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const submission = this.data.find(item => item.Id === parseInt(id));
    if (!submission) {
      throw new Error("Submission not found");
    }
    return { ...submission };
  }

  async create(submissionData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newId = Math.max(...this.data.map(item => item.Id), 0) + 1;
    const newSubmission = {
      Id: newId,
      ...submissionData,
      readings: submissionData.readings?.map((reading, index) => ({
        Id: (Math.max(...this.data.flatMap(s => s.readings?.map(r => r.Id) || []), 0) + index + 1),
        submissionId: newId,
        ...reading
      })) || []
    };
    
    this.data.push(newSubmission);
    return { ...newSubmission };
  }

  async update(id, submissionData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Submission not found");
    }
    
    const updatedSubmission = {
      ...this.data[index],
      ...submissionData,
      Id: parseInt(id),
      readings: submissionData.readings?.map((reading, idx) => ({
        Id: reading.Id || (Math.max(...this.data.flatMap(s => s.readings?.map(r => r.Id) || []), 0) + idx + 1),
        submissionId: parseInt(id),
        ...reading
      })) || []
    };
    
    this.data[index] = updatedSubmission;
    return { ...updatedSubmission };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Submission not found");
    }
    
    this.data.splice(index, 1);
    return true;
  }

  async getByDateRange(startDate, endDate) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.data.filter(submission => {
      const submissionDate = new Date(submission.dayKey);
      return submissionDate >= new Date(startDate) && submissionDate <= new Date(endDate);
    });
  }

  async getDailySummaries() {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    return this.data.map(submission => ({
      dayKey: submission.dayKey,
      avgSys: submission.avgSys,
      avgDia: submission.avgDia,
      avgPulse: submission.avgPulse,
      exceededThreshold: submission.avgSys >= 180 || submission.avgDia >= 110
    }));
  }
}

export const submissionsService = new SubmissionsService();