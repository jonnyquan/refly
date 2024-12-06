// generated with @7nohe/openapi-react-query-codegen@2.0.0-beta.3 

import { type Options } from "@hey-api/client-fetch";
import { InfiniteData, useInfiniteQuery, UseInfiniteQueryOptions } from "@tanstack/react-query";
import { listCanvases, listConversations, listDocuments, listLabelClasses, listLabelInstances, listProjects, listResources, listSkillInstances, listSkillJobs, listSkillTriggers } from "../requests/services.gen";
import { ListCanvasesData, ListCanvasesError, ListConversationsData, ListConversationsError, ListDocumentsData, ListDocumentsError, ListLabelClassesData, ListLabelClassesError, ListLabelInstancesData, ListLabelInstancesError, ListProjectsData, ListProjectsError, ListResourcesData, ListResourcesError, ListSkillInstancesData, ListSkillInstancesError, ListSkillJobsData, ListSkillJobsError, ListSkillTriggersData, ListSkillTriggersError } from "../requests/types.gen";
import * as Common from "./common";
export const useListCanvasesInfinite = <TData = InfiniteData<Common.ListCanvasesDefaultResponse>, TError = ListCanvasesError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListCanvasesData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseListCanvasesKeyFn(clientOptions, queryKey), queryFn: ({ pageParam }) => listCanvases({ ...clientOptions, query: { ...clientOptions.query, page: pageParam as number } }).then(response => response.data as TData) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useListResourcesInfinite = <TData = InfiniteData<Common.ListResourcesDefaultResponse>, TError = ListResourcesError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListResourcesData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseListResourcesKeyFn(clientOptions, queryKey), queryFn: ({ pageParam }) => listResources({ ...clientOptions, query: { ...clientOptions.query, page: pageParam as number } }).then(response => response.data as TData) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useListDocumentsInfinite = <TData = InfiniteData<Common.ListDocumentsDefaultResponse>, TError = ListDocumentsError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListDocumentsData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseListDocumentsKeyFn(clientOptions, queryKey), queryFn: ({ pageParam }) => listDocuments({ ...clientOptions, query: { ...clientOptions.query, page: pageParam as number } }).then(response => response.data as TData) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useListProjectsInfinite = <TData = InfiniteData<Common.ListProjectsDefaultResponse>, TError = ListProjectsError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListProjectsData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseListProjectsKeyFn(clientOptions, queryKey), queryFn: ({ pageParam }) => listProjects({ ...clientOptions, query: { ...clientOptions.query, page: pageParam as number } }).then(response => response.data as TData) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useListLabelClassesInfinite = <TData = InfiniteData<Common.ListLabelClassesDefaultResponse>, TError = ListLabelClassesError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListLabelClassesData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseListLabelClassesKeyFn(clientOptions, queryKey), queryFn: ({ pageParam }) => listLabelClasses({ ...clientOptions, query: { ...clientOptions.query, page: pageParam as number } }).then(response => response.data as TData) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useListLabelInstancesInfinite = <TData = InfiniteData<Common.ListLabelInstancesDefaultResponse>, TError = ListLabelInstancesError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListLabelInstancesData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseListLabelInstancesKeyFn(clientOptions, queryKey), queryFn: ({ pageParam }) => listLabelInstances({ ...clientOptions, query: { ...clientOptions.query, page: pageParam as number } }).then(response => response.data as TData) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useListSkillInstancesInfinite = <TData = InfiniteData<Common.ListSkillInstancesDefaultResponse>, TError = ListSkillInstancesError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListSkillInstancesData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseListSkillInstancesKeyFn(clientOptions, queryKey), queryFn: ({ pageParam }) => listSkillInstances({ ...clientOptions, query: { ...clientOptions.query, page: pageParam as number } }).then(response => response.data as TData) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useListSkillTriggersInfinite = <TData = InfiniteData<Common.ListSkillTriggersDefaultResponse>, TError = ListSkillTriggersError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListSkillTriggersData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseListSkillTriggersKeyFn(clientOptions, queryKey), queryFn: ({ pageParam }) => listSkillTriggers({ ...clientOptions, query: { ...clientOptions.query, page: pageParam as number } }).then(response => response.data as TData) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useListSkillJobsInfinite = <TData = InfiniteData<Common.ListSkillJobsDefaultResponse>, TError = ListSkillJobsError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListSkillJobsData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseListSkillJobsKeyFn(clientOptions, queryKey), queryFn: ({ pageParam }) => listSkillJobs({ ...clientOptions, query: { ...clientOptions.query, page: pageParam as number } }).then(response => response.data as TData) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useListConversationsInfinite = <TData = InfiniteData<Common.ListConversationsDefaultResponse>, TError = ListConversationsError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListConversationsData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseListConversationsKeyFn(clientOptions, queryKey), queryFn: ({ pageParam }) => listConversations({ ...clientOptions, query: { ...clientOptions.query, page: pageParam as number } }).then(response => response.data as TData) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});