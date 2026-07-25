---
displayed_sidbar: restfulSidebar
slug: /restful/error-codes-v2
beta: FALSE
notebook: FALSE
sidebar_position: 2
---

# 错误码 (v2)

您可在本页查找 Zilliz Cloud RESTful API (v2) 的错误码，以便更好地理解接口调用过程中可能遇到的问题。


**96000**

Invalid CloudId. Please use the ListCloudProviders API to obtain a list of supported cloudIds.

**96001**

Invalid RegionId. Please use the ListCloudRegions API to obtain a list of supported regionIds.

**96002**

Invalid cuSize. The parameter value should be positive.

**96003**

Invalid cuType.

**96004**

Invalid dedicated plan.

**96005**

Invalid projectId. The projectId should be like proj-xxxxxxxx. Please use the ListProjects API to obtain your scoped projects.

**96006**

Invalid ISO 8601 duration format in UTC.

**96007**

Invalid ISO 8601 timestamp format in UTC.

**96008**

The parameter value for pageSize should be between 1 and 100.

**96009**

The parameter currentPage should have a value between 1 and the maximum value of Int.

**96010**

Invalid clusterName. Cluster names can only contain alphanumeric letters and hyphens.

**96011**

Either a valid period or valid start and end parameters should be provided.

**96012**

You don't have permission for this project. Project org and Apikey org does not match.

**96013**

You don't have permission for this project. Org owner or project owner is needed.

**96014**

You don't have permission for this cluster. Cluster org and Apikey org does not match.

**96015**

You don't have permission for this cluster. Org owner or project owner is needed.

**96016**

You don't have permission for this cluster. Please check your Apikey scope.

**96017**

The specified cluster name already exists under project.

**96018**

Cluster not found. Please use the ListClusters API to obtain your scoped clusters.

**96019**

This region does not support free plan.

**96020**

This region does not support serverless plan.

**96021**

Free cluster does not support this operation.

**96022**

Serverless cluster does not support this operation.

**96023**

The specified class does not exist. Please check the cuType, cuSize and plan combination.

**96024**

Failed query instance metrics. %s (details)

**96025**

Empty clusterId. Please specify a clusterId.

**96026**

Job not found. Please check your request parameter.

**96027**

You don't have permission for this project. Please check your Apikey scope.

**96028**

Feature only supported for enterprise plan clusters.

**96029**

Invalid backupType.

**96030**

Invalid backup creationMethod.

**96031**

Invalid backup restore policy. The value of 'collectionStatus' should be KEEP or RELEASE.

**96032**

Invalid backup policy frequency.

**96033**

Invalid backup policy startTime.

**96034**

Invalid auto backup retentionDays. The value should be between 1 and 30.

**96035**

Invalid time range. Please check start and end time parameters.

**96036**

Invalid clusterId.

**96037**

Invalid targetCollectionStatus. The value should be LOADED or UNLOADED.

**96038**

Failed to create backup. %s

**96039**

Failed to restore collection backup. %s

**96040**

Failed to restore cluster backup. %s