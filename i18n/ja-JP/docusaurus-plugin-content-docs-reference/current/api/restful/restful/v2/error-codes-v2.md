---
displayed_sidbar: restfulSidebar
slug: /restful/error-codes-v2
title: エラーコード
description: このページでは、Zilliz Cloud RESTful API が返すエラーコードを一覧表示します。
beta: FALSE
notebook: FALSE
sidebar_position: 2
---

# エラーコード (v2)

このページでは、Zilliz Cloud RESTful API (v2) が返すエラーコードを一覧表示します。

**96000**

無効な CloudId です。サポートされている cloudIds の一覧を取得するには、ListCloudProviders API を使用してください。

**96001**

無効な RegionId です。サポートされている regionIds の一覧を取得するには、ListCloudRegions API を使用してください。

**96002**

無効な cuSize です。パラメータ値は正の値である必要があります。

**96003**

無効な cuType です。

**96004**

無効な dedicated plan です。

**96005**

無効な projectId です。projectId は proj-xxxxxxxx の形式である必要があります。スコープ対象の project を取得するには、ListProjects API を使用してください。

**96006**

UTC における ISO 8601 duration 形式が無効です。

**96007**

UTC における ISO 8601 timestamp 形式が無効です。

**96008**

pageSize のパラメータ値は 1 から 100 の間である必要があります。

**96009**

パラメータ currentPage は 1 から Int の最大値までの値である必要があります。

**96010**

無効な clusterName です。cluster 名には英数字とハイフンのみ使用できます。

**96011**

有効な period、または有効な start と end のパラメータを指定する必要があります。

**96012**

この project に対する権限がありません。project の org と Apikey の org が一致しません。

**96013**

この project に対する権限がありません。org owner または project owner が必要です。

**96014**

この cluster に対する権限がありません。cluster の org と Apikey の org が一致しません。

**96015**

この cluster に対する権限がありません。org owner または project owner が必要です。

**96016**

この cluster に対する権限がありません。Apikey のスコープを確認してください。

**96017**

指定された cluster 名は、project 配下ですでに存在しています。

**96018**

cluster が見つかりません。スコープ対象の cluster を取得するには、ListClusters API を使用してください。

**96019**

この region は free plan をサポートしていません。

**96020**

この region は serverless plan をサポートしていません。

**96021**

free cluster ではこの操作はサポートされていません。

**96022**

serverless cluster ではこの操作はサポートされていません。

**96023**

指定された class は存在しません。cuType、cuSize、plan の組み合わせを確認してください。

**96024**

インスタンスメトリクスのクエリに失敗しました。%s（詳細）

**96025**

clusterId が空です。clusterId を指定してください。

**96026**

ジョブが見つかりません。リクエストパラメータを確認してください。

**96027**

この project に対する権限がありません。Apikey のスコープを確認してください。

**96028**

この機能は enterprise plan の cluster のみでサポートされています。

**96029**

無効な backupType です。

**96030**

無効な backup creationMethod です。

**96031**

無効な backup restore policy です。`collectionStatus` の値は KEEP または RELEASE である必要があります。

**96032**

無効な backup policy frequency です。

**96033**

無効な backup policy startTime です。

**96034**

無効な auto backup retentionDays です。値は 1 から 30 の間である必要があります。

**96035**

無効な時間範囲です。start および end の time パラメータを確認してください。

**96036**

無効な clusterId です。

**96037**

無効な targetCollectionStatus です。値は LOADED または UNLOADED である必要があります。

**96038**

backup の作成に失敗しました。%s

**96039**

collection backup の復元に失敗しました。%s

**96040**

cluster backup の復元に失敗しました。%s
