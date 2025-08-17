import audioTracksData from "@/services/mockData/audioTracks.json";

let tracks = [...audioTracksData];

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const audioTracksService = {
  async getAll() {
    await delay(250);
    return [...tracks];
  },

  async getByProjectId(projectId) {
    await delay(200);
    return tracks.filter(track => track.projectId === parseInt(projectId));
  },

  async getById(id) {
    await delay(200);
    const track = tracks.find(t => t.Id === parseInt(id));
    if (!track) {
      throw new Error("Audio track not found");
    }
    return { ...track };
  },

  async create(trackData) {
    await delay(500);
    const newTrack = {
      Id: Math.max(...tracks.map(t => t.Id)) + 1,
      projectId: parseInt(trackData.projectId),
      name: trackData.name || "New Track",
      audioBuffer: trackData.audioBuffer || null,
      waveformData: trackData.waveformData || null,
      duration: trackData.duration || 0,
      settings: trackData.settings || {},
      createdAt: new Date().toISOString()
    };
    
    tracks.push(newTrack);
    return { ...newTrack };
  },

  async update(id, updates) {
    await delay(400);
    const index = tracks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Audio track not found");
    }
    
    tracks[index] = {
      ...tracks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return { ...tracks[index] };
  },

  async delete(id) {
    await delay(250);
    const index = tracks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Audio track not found");
    }
    
    const deleted = tracks.splice(index, 1)[0];
    return { ...deleted };
  },

  async processWithAutotune(id, settings) {
    await delay(2000); // Simulate processing time
    const track = await this.getById(id);
    
    return this.update(id, {
      settings: {
        ...track.settings,
        autotune: settings,
        processed: true
      }
    });
  },

  async processWithMastering(id, settings) {
    await delay(1500); // Simulate processing time
    const track = await this.getById(id);
    
    return this.update(id, {
      settings: {
        ...track.settings,
        mastering: settings,
        mastered: true
      }
    });
  }
};