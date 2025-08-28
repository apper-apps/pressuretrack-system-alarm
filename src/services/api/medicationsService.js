import medicationsData from "@/services/mockData/medications.json";

class MedicationsService {
  constructor() {
    this.data = [...medicationsData];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 250));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const medication = this.data.find(item => item.Id === parseInt(id));
    if (!medication) {
      throw new Error("Medication not found");
    }
    return { ...medication };
  }

  async create(medicationData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newId = Math.max(...this.data.map(item => item.Id), 0) + 1;
    const newMedication = {
      Id: newId,
      ...medicationData
    };
    
    this.data.push(newMedication);
    return { ...newMedication };
  }

  async update(id, medicationData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Medication not found");
    }
    
    const updatedMedication = {
      ...this.data[index],
      ...medicationData,
      Id: parseInt(id)
    };
    
    this.data[index] = updatedMedication;
    return { ...updatedMedication };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Medication not found");
    }
    
    this.data.splice(index, 1);
    return true;
  }

  async getActive() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.data.filter(med => !med.endDate || new Date(med.endDate) >= new Date());
  }

  async getByDateRange(startDate, endDate) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.data.filter(med => {
      const medStart = new Date(med.startDate);
      const medEnd = med.endDate ? new Date(med.endDate) : new Date();
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);
      
      return medStart <= rangeEnd && medEnd >= rangeStart;
    });
  }
}

export const medicationsService = new MedicationsService();