import { supabase } from './supabase';
import { SearchResponse } from '../hooks/useKnowledgeGPT';
import { getUserId } from './userApi';

// Types for Supabase tables
export interface SupabaseSearchHistory {
  id: string;
  user_id: string;
  query: string;
  results: any; // JSONB - will store SearchResponse
  results_count: number;
  created_at: string;
}

export interface SupabaseConsolidatedProfile {
  id: string;
  user_id: string;
  person_id: string;
  consolidated_data: any; // JSONB - will store TrackedPerson data
  match_score: number;
  priority_level: string;
  notes: string;
  created_at: string;
  // Individual fields for easier querying
  name: string;
  first_name: string;
  last_name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  linkedin_url: string;
  prospect_analysis_full: string;
}

// Local types
export interface HistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  results?: SearchResponse | null;
  error?: string | null;
}

export interface TrackedPerson {
  id: string;
  name: string;
  title: string;
  company: string;
  profilePhoto: string;
  trackedSince: string;
  lastEvent: string;
  isTracking: boolean;
  trackingReason: string;
  cmi: number;
  rbfs: number;
  ias: number;
}

// Search History Functions
export const loadSearchHistory = async (userId: string): Promise<HistoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading search history:', error);
      return [];
    }

    return data.map((item: SupabaseSearchHistory) => ({
      id: item.id,
      query: item.query,
      timestamp: new Date(item.created_at),
      results: item.results as SearchResponse | null,
      error: null // We don't store errors in the database currently
    }));
  } catch (error) {
    console.error('Error loading search history:', error);
    return [];
  }
};

export const saveSearchHistory = async (userId: string, historyItem: HistoryItem): Promise<void> => {
  try {
    const { error } = await supabase
      .from('search_history')
      .insert({
        user_id: userId,
        query: historyItem.query,
        results: historyItem.results || null,
        results_count: historyItem.results?.candidates?.length || 0
      });

    if (error) {
      console.error('Error saving search history:', error);
    }
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

export const clearSearchHistory = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing search history:', error);
    }
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};

// Tracked People Functions
export const loadTrackedPeople = async (userId: string): Promise<TrackedPerson[]> => {
  try {
    const { data, error } = await supabase
      .from('consolidated_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tracked people:', error);
      return [];
    }

    return data.map((item: SupabaseConsolidatedProfile) => {
      const consolidatedData = item.consolidated_data || {};
      return {
        id: item.person_id,
        name: item.name || consolidatedData.name || '',
        title: item.title || consolidatedData.title || '',
        company: item.company || consolidatedData.company || '',
        profilePhoto: consolidatedData.profilePhoto || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`,
        trackedSince: item.created_at.split('T')[0],
        lastEvent: consolidatedData.lastEvent || item.created_at.split('T')[0],
        isTracking: consolidatedData.isTracking !== false, // Default to true
        trackingReason: consolidatedData.trackingReason || 'Added to tracking',
        cmi: consolidatedData.cmi || 70,
        rbfs: consolidatedData.rbfs || 45,
        ias: consolidatedData.ias || 75
      };
    });
  } catch (error) {
    console.error('Error loading tracked people:', error);
    return [];
  }
};

export const saveTrackedPerson = async (userId: string, person: TrackedPerson): Promise<void> => {
  try {
    // Split name into first and last name
    const nameParts = person.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Check if record exists first
    const { data: existing } = await supabase
      .from('consolidated_profiles')
      .select('id')
      .eq('user_id', userId)
      .eq('person_id', person.id)
      .single();

    const recordData = {
      user_id: userId,
      person_id: person.id,
      name: person.name,
      first_name: firstName,
      last_name: lastName,
      title: person.title,
      company: person.company,
      email: person.id.includes('@') ? person.id : null,
      consolidated_data: {
        profilePhoto: person.profilePhoto,
        trackedSince: person.trackedSince,
        lastEvent: person.lastEvent,
        isTracking: person.isTracking,
        trackingReason: person.trackingReason,
        cmi: person.cmi,
        rbfs: person.rbfs,
        ias: person.ias
      },
      match_score: person.cmi,
      priority_level: person.cmi > 70 ? 'high' : person.cmi > 50 ? 'medium' : 'low',
      notes: person.trackingReason
    };

    let error;
    if (existing) {
      // Update existing record
      const result = await supabase
        .from('consolidated_profiles')
        .update(recordData)
        .eq('user_id', userId)
        .eq('person_id', person.id);
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase
        .from('consolidated_profiles')
        .insert(recordData);
      error = result.error;
    }

    if (error) {
      console.error('Error saving tracked person:', error);
    }
  } catch (error) {
    console.error('Error saving tracked person:', error);
  }
};

export const deleteTrackedPerson = async (userId: string, personId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('consolidated_profiles')
      .delete()
      .eq('user_id', userId)
      .eq('person_id', personId);

    if (error) {
      console.error('Error deleting tracked person:', error);
    }
  } catch (error) {
    console.error('Error deleting tracked person:', error);
  }
};