import audioProjectsData from "@/services/mockData/audioProjects.json";

let projects = [...audioProjectsData];

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const audioProjectsService = {
  async getAll() {
    await delay(300);
    return [...projects];
  },

  async getById(id) {
    await delay(200);
    const project = projects.find(p => p.Id === parseInt(id));
    if (!project) {
      throw new Error("Audio project not found");
    }
    return { ...project };
  },

  async create(projectData) {
    await delay(400);
    const newProject = {
      Id: Math.max(...projects.map(p => p.Id)) + 1,
      name: projectData.name || "Untitled Project",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tempo: projectData.tempo || 120,
      key: projectData.key || "C",
      duration: projectData.duration || 0,
      settings: projectData.settings || {}
    };
    
    projects.push(newProject);
    return { ...newProject };
  },

  async update(id, updates) {
    await delay(300);
    const index = projects.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Audio project not found");
    }
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return { ...projects[index] };
  },

  async delete(id) {
    await delay(250);
    const index = projects.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Audio project not found");
    }
    
    const deleted = projects.splice(index, 1)[0];
    return { ...deleted };
  }
};