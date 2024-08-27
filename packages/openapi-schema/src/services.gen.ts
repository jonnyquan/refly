// This file is auto-generated by @hey-api/openapi-ts

import { client, type Options } from '@hey-api/client-fetch';
import type {
  ListResourcesData,
  ListResourcesError,
  ListResourcesResponse,
  GetResourceDetailData,
  GetResourceDetailError,
  GetResourceDetailResponse2,
  UpdateResourceData,
  UpdateResourceError,
  UpdateResourceResponse,
  CreateResourceData,
  CreateResourceError,
  CreateResourceResponse,
  BatchCreateResourceData,
  BatchCreateResourceError,
  BatchCreateResourceResponse2,
  DeleteResourceData,
  DeleteResourceError,
  DeleteResourceResponse,
  ListNotesData,
  ListNotesError,
  ListNotesResponse,
  GetNoteDetailData,
  GetNoteDetailError,
  GetNoteDetailResponse2,
  UpdateNoteData,
  UpdateNoteError,
  UpdateNoteResponse,
  CreateNoteData,
  CreateNoteError,
  CreateNoteResponse,
  DeleteNoteData,
  DeleteNoteError,
  DeleteNoteResponse,
  ListCollectionsData,
  ListCollectionsError,
  ListCollectionsResponse,
  GetCollectionDetailData,
  GetCollectionDetailError,
  GetCollectionDetailResponse2,
  UpdateCollectionData,
  UpdateCollectionError,
  UpdateCollectionResponse,
  CreateCollectionData,
  CreateCollectionError,
  CreateCollectionResponse,
  AddResourceToCollectionData,
  AddResourceToCollectionError,
  AddResourceToCollectionResponse,
  RemoveResourceFromCollectionData,
  RemoveResourceFromCollectionError,
  RemoveResourceFromCollectionResponse,
  DeleteCollectionData,
  DeleteCollectionError,
  DeleteCollectionResponse,
  ListLabelClassesData,
  ListLabelClassesError,
  ListLabelClassesResponse2,
  CreateLabelClassData,
  CreateLabelClassError,
  CreateLabelClassResponse,
  UpdateLabelClassData,
  UpdateLabelClassError,
  UpdateLabelClassResponse,
  DeleteLabelClassData,
  DeleteLabelClassError,
  DeleteLabelClassResponse,
  ListLabelInstancesData,
  ListLabelInstancesError,
  ListLabelInstancesResponse2,
  CreateLabelInstanceData,
  CreateLabelInstanceError,
  CreateLabelInstanceResponse,
  UpdateLabelInstanceData,
  UpdateLabelInstanceError,
  UpdateLabelInstanceResponse,
  DeleteLabelInstanceData,
  DeleteLabelInstanceError,
  DeleteLabelInstanceResponse,
  ListSkillTemplatesData,
  ListSkillTemplatesError,
  ListSkillTemplatesResponse,
  ListSkillInstancesData,
  ListSkillInstancesError,
  ListSkillInstancesResponse,
  CreateSkillInstanceData,
  CreateSkillInstanceError,
  CreateSkillInstanceResponse2,
  UpdateSkillInstanceData,
  UpdateSkillInstanceError,
  UpdateSkillInstanceResponse2,
  DeleteSkillInstanceData,
  DeleteSkillInstanceError,
  DeleteSkillInstanceResponse,
  InvokeSkillData,
  InvokeSkillError,
  InvokeSkillResponse2,
  StreamInvokeSkillData,
  StreamInvokeSkillError,
  StreamInvokeSkillResponse,
  ListSkillTriggersData,
  ListSkillTriggersError,
  ListSkillTriggersResponse,
  CreateSkillTriggerData,
  CreateSkillTriggerError,
  CreateSkillTriggerResponse2,
  UpdateSkillTriggerData,
  UpdateSkillTriggerError,
  UpdateSkillTriggerResponse2,
  DeleteSkillTriggerData,
  DeleteSkillTriggerError,
  DeleteSkillTriggerResponse,
  ListSkillJobsData,
  ListSkillJobsError,
  ListSkillJobsResponse2,
  GetSkillJobDetailData,
  GetSkillJobDetailError,
  GetSkillJobDetailResponse2,
  ListConversationsError,
  ListConversationsResponse,
  GetConversationDetailData,
  GetConversationDetailError,
  GetConversationDetailResponse2,
  GetSettingsError,
  GetSettingsResponse,
  UpdateSettingsData,
  UpdateSettingsError,
  UpdateSettingsResponse,
  SearchData,
  SearchError,
  SearchResponse2,
  ScrapeData,
  ScrapeError,
  ScrapeResponse,
} from './types.gen';

/**
 * List resources
 * List all resources
 */
export const listResources = (options?: Options<ListResourcesData>) => {
  return (options?.client ?? client).get<ListResourcesResponse, ListResourcesError>({
    ...options,
    url: '/knowledge/resource/list',
  });
};

/**
 * Get resource detail
 * Return resource detail along with its document content
 */
export const getResourceDetail = (options: Options<GetResourceDetailData>) => {
  return (options?.client ?? client).get<GetResourceDetailResponse2, GetResourceDetailError>({
    ...options,
    url: '/knowledge/resource/detail',
  });
};

/**
 * Update resource
 * Update an existing resource
 */
export const updateResource = (options: Options<UpdateResourceData>) => {
  return (options?.client ?? client).post<UpdateResourceResponse, UpdateResourceError>({
    ...options,
    url: '/knowledge/resource/update',
  });
};

/**
 * Create new resource
 * Create a new resource
 */
export const createResource = (options: Options<CreateResourceData>) => {
  return (options?.client ?? client).post<CreateResourceResponse, CreateResourceError>({
    ...options,
    url: '/knowledge/resource/new',
  });
};

/**
 * Batch create new resources
 * Batch create a new resource
 */
export const batchCreateResource = (options: Options<BatchCreateResourceData>) => {
  return (options?.client ?? client).post<BatchCreateResourceResponse2, BatchCreateResourceError>({
    ...options,
    url: '/knowledge/resource/batch',
  });
};

/**
 * Delete resource
 * Delete an existing resource
 */
export const deleteResource = (options: Options<DeleteResourceData>) => {
  return (options?.client ?? client).post<DeleteResourceResponse, DeleteResourceError>({
    ...options,
    url: '/knowledge/resource/delete',
  });
};

/**
 * List user notes
 * List all notes for a user
 */
export const listNotes = (options?: Options<ListNotesData>) => {
  return (options?.client ?? client).get<ListNotesResponse, ListNotesError>({
    ...options,
    url: '/knowledge/note/list',
  });
};

/**
 * Get note detail
 * Return note detail
 */
export const getNoteDetail = (options: Options<GetNoteDetailData>) => {
  return (options?.client ?? client).get<GetNoteDetailResponse2, GetNoteDetailError>({
    ...options,
    url: '/knowledge/note/detail',
  });
};

/**
 * Update note
 * Update an existing note
 */
export const updateNote = (options: Options<UpdateNoteData>) => {
  return (options?.client ?? client).post<UpdateNoteResponse, UpdateNoteError>({
    ...options,
    url: '/knowledge/note/update',
  });
};

/**
 * Create new note
 * Create a new note
 */
export const createNote = (options: Options<CreateNoteData>) => {
  return (options?.client ?? client).post<CreateNoteResponse, CreateNoteError>({
    ...options,
    url: '/knowledge/note/new',
  });
};

/**
 * Delete note
 * Delete an existing note
 */
export const deleteNote = (options: Options<DeleteNoteData>) => {
  return (options?.client ?? client).post<DeleteNoteResponse, DeleteNoteError>({
    ...options,
    url: '/knowledge/note/delete',
  });
};

/**
 * List user collections
 * List all collections for a user
 */
export const listCollections = (options?: Options<ListCollectionsData>) => {
  return (options?.client ?? client).get<ListCollectionsResponse, ListCollectionsError>({
    ...options,
    url: '/knowledge/collection/list',
  });
};

/**
 * Get collection detail
 * Return collection details along with its resources
 */
export const getCollectionDetail = (options: Options<GetCollectionDetailData>) => {
  return (options?.client ?? client).get<GetCollectionDetailResponse2, GetCollectionDetailError>({
    ...options,
    url: '/knowledge/collection/detail',
  });
};

/**
 * Update collection
 * Update an existing collection
 */
export const updateCollection = (options: Options<UpdateCollectionData>) => {
  return (options?.client ?? client).post<UpdateCollectionResponse, UpdateCollectionError>({
    ...options,
    url: '/knowledge/collection/update',
  });
};

/**
 * Create new collection
 * Create a new collection
 */
export const createCollection = (options: Options<CreateCollectionData>) => {
  return (options?.client ?? client).post<CreateCollectionResponse, CreateCollectionError>({
    ...options,
    url: '/knowledge/collection/new',
  });
};

/**
 * Add resource to collection
 * Add an existing resource to a collection
 */
export const addResourceToCollection = (options: Options<AddResourceToCollectionData>) => {
  return (options?.client ?? client).post<AddResourceToCollectionResponse, AddResourceToCollectionError>({
    ...options,
    url: '/knowledge/collection/addResource',
  });
};

/**
 * Remove resource from collection
 * Remove an existing resource from a collection
 */
export const removeResourceFromCollection = (options: Options<RemoveResourceFromCollectionData>) => {
  return (options?.client ?? client).post<RemoveResourceFromCollectionResponse, RemoveResourceFromCollectionError>({
    ...options,
    url: '/knowledge/collection/removeResource',
  });
};

/**
 * Delete collection
 * Delete an existing collection
 */
export const deleteCollection = (options: Options<DeleteCollectionData>) => {
  return (options?.client ?? client).post<DeleteCollectionResponse, DeleteCollectionError>({
    ...options,
    url: '/knowledge/collection/delete',
  });
};

/**
 * List label classes
 * List all label classes
 */
export const listLabelClasses = (options?: Options<ListLabelClassesData>) => {
  return (options?.client ?? client).get<ListLabelClassesResponse2, ListLabelClassesError>({
    ...options,
    url: '/label/class/list',
  });
};

/**
 * Create new label class
 * Create a new label class
 */
export const createLabelClass = (options: Options<CreateLabelClassData>) => {
  return (options?.client ?? client).post<CreateLabelClassResponse, CreateLabelClassError>({
    ...options,
    url: '/label/class/new',
  });
};

/**
 * Update label class
 * Update an existing label class
 */
export const updateLabelClass = (options: Options<UpdateLabelClassData>) => {
  return (options?.client ?? client).post<UpdateLabelClassResponse, UpdateLabelClassError>({
    ...options,
    url: '/label/class/update',
  });
};

/**
 * Delete label class
 * Delete an existing label class
 */
export const deleteLabelClass = (options: Options<DeleteLabelClassData>) => {
  return (options?.client ?? client).post<DeleteLabelClassResponse, DeleteLabelClassError>({
    ...options,
    url: '/label/class/delete',
  });
};

/**
 * List labels
 * List all label instances
 */
export const listLabelInstances = (options?: Options<ListLabelInstancesData>) => {
  return (options?.client ?? client).get<ListLabelInstancesResponse2, ListLabelInstancesError>({
    ...options,
    url: '/label/instance/list',
  });
};

/**
 * Create new label instance
 * Create new label instance
 */
export const createLabelInstance = (options: Options<CreateLabelInstanceData>) => {
  return (options?.client ?? client).post<CreateLabelInstanceResponse, CreateLabelInstanceError>({
    ...options,
    url: '/label/instance/new',
  });
};

/**
 * Update label
 * Update an existing label instance
 */
export const updateLabelInstance = (options: Options<UpdateLabelInstanceData>) => {
  return (options?.client ?? client).post<UpdateLabelInstanceResponse, UpdateLabelInstanceError>({
    ...options,
    url: '/label/instance/update',
  });
};

/**
 * Delete label
 * Delete an existing label
 */
export const deleteLabelInstance = (options: Options<DeleteLabelInstanceData>) => {
  return (options?.client ?? client).post<DeleteLabelInstanceResponse, DeleteLabelInstanceError>({
    ...options,
    url: '/label/instance/delete',
  });
};

/**
 * List skill templates
 * List all skill templates
 */
export const listSkillTemplates = (options?: Options<ListSkillTemplatesData>) => {
  return (options?.client ?? client).get<ListSkillTemplatesResponse, ListSkillTemplatesError>({
    ...options,
    url: '/skill/template/list',
  });
};

/**
 * List skill instances
 * List skill instances for a user
 */
export const listSkillInstances = (options?: Options<ListSkillInstancesData>) => {
  return (options?.client ?? client).get<ListSkillInstancesResponse, ListSkillInstancesError>({
    ...options,
    url: '/skill/instance/list',
  });
};

/**
 * Create new skill instance
 * Create a new skill instance for user
 */
export const createSkillInstance = (options: Options<CreateSkillInstanceData>) => {
  return (options?.client ?? client).post<CreateSkillInstanceResponse2, CreateSkillInstanceError>({
    ...options,
    url: '/skill/instance/new',
  });
};

/**
 * Update skill instance
 * Update an existing skill instance
 */
export const updateSkillInstance = (options: Options<UpdateSkillInstanceData>) => {
  return (options?.client ?? client).post<UpdateSkillInstanceResponse2, UpdateSkillInstanceError>({
    ...options,
    url: '/skill/instance/update',
  });
};

/**
 * Delete skill instance
 * Delete an existing skill instance
 */
export const deleteSkillInstance = (options: Options<DeleteSkillInstanceData>) => {
  return (options?.client ?? client).post<DeleteSkillInstanceResponse, DeleteSkillInstanceError>({
    ...options,
    url: '/skill/instance/delete',
  });
};

/**
 * Invoke skill
 * Invoke a skill
 */
export const invokeSkill = (options: Options<InvokeSkillData>) => {
  return (options?.client ?? client).post<InvokeSkillResponse2, InvokeSkillError>({
    ...options,
    url: '/skill/invoke',
  });
};

/**
 * Stream invoke skill
 * Invoke a skill and return SSE stream
 */
export const streamInvokeSkill = (options: Options<StreamInvokeSkillData>) => {
  return (options?.client ?? client).post<StreamInvokeSkillResponse, StreamInvokeSkillError>({
    ...options,
    url: '/skill/streamInvoke',
  });
};

/**
 * List skill triggers
 * List all skill triggers
 */
export const listSkillTriggers = (options?: Options<ListSkillTriggersData>) => {
  return (options?.client ?? client).get<ListSkillTriggersResponse, ListSkillTriggersError>({
    ...options,
    url: '/skill/trigger/list',
  });
};

/**
 * Create new trigger
 * Create a new trigger
 */
export const createSkillTrigger = (options: Options<CreateSkillTriggerData>) => {
  return (options?.client ?? client).post<CreateSkillTriggerResponse2, CreateSkillTriggerError>({
    ...options,
    url: '/skill/trigger/new',
  });
};

/**
 * Update trigger
 * Update an existing trigger
 */
export const updateSkillTrigger = (options: Options<UpdateSkillTriggerData>) => {
  return (options?.client ?? client).post<UpdateSkillTriggerResponse2, UpdateSkillTriggerError>({
    ...options,
    url: '/skill/trigger/update',
  });
};

/**
 * Delete trigger
 * Delete an existing trigger
 */
export const deleteSkillTrigger = (options: Options<DeleteSkillTriggerData>) => {
  return (options?.client ?? client).post<DeleteSkillTriggerResponse, DeleteSkillTriggerError>({
    ...options,
    url: '/skill/trigger/delete',
  });
};

/**
 * Get skill jobs
 * Get skill jobs
 */
export const listSkillJobs = (options?: Options<ListSkillJobsData>) => {
  return (options?.client ?? client).get<ListSkillJobsResponse2, ListSkillJobsError>({
    ...options,
    url: '/skill/job/list',
  });
};

/**
 * Get skill job detail
 * Get skill job detail
 */
export const getSkillJobDetail = (options?: Options<GetSkillJobDetailData>) => {
  return (options?.client ?? client).get<GetSkillJobDetailResponse2, GetSkillJobDetailError>({
    ...options,
    url: '/skill/job/detail',
  });
};

/**
 * List conversations
 * List all conversations
 */
export const listConversations = (options?: Options) => {
  return (options?.client ?? client).get<ListConversationsResponse, ListConversationsError>({
    ...options,
    url: '/conversation/list',
  });
};

/**
 * Get conversation detail
 * Get conversation detail
 */
export const getConversationDetail = (options: Options<GetConversationDetailData>) => {
  return (options?.client ?? client).get<GetConversationDetailResponse2, GetConversationDetailError>({
    ...options,
    url: '/conversation/{convId}',
  });
};

/**
 * Get user settings
 * Return settings for current user
 */
export const getSettings = (options?: Options) => {
  return (options?.client ?? client).get<GetSettingsResponse, GetSettingsError>({
    ...options,
    url: '/user/settings',
  });
};

/**
 * Update user settings
 * Update settings for current user
 */
export const updateSettings = (options: Options<UpdateSettingsData>) => {
  return (options?.client ?? client).put<UpdateSettingsResponse, UpdateSettingsError>({
    ...options,
    url: '/user/settings',
  });
};

/**
 * Search
 * Search for everything
 */
export const search = (options: Options<SearchData>) => {
  return (options?.client ?? client).post<SearchResponse2, SearchError>({
    ...options,
    url: '/search',
  });
};

/**
 * Scrape
 * Scrape a weblink
 */
export const scrape = (options: Options<ScrapeData>) => {
  return (options?.client ?? client).post<ScrapeResponse, ScrapeError>({
    ...options,
    url: '/misc/scrape',
  });
};