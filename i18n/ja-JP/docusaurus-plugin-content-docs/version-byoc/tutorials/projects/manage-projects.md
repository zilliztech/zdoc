---
title: "プロジェクトの管理 | BYOC"
slug: /manage-projects
sidebar_label: "プロジェクトの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、プロジェクトは組織内の論理的なコンテナとして機能し、クラスターや関連リソースをグループ化します。ビジネスのさまざまな側面に合わせた複数のプロジェクトを作成できます。たとえば、会社がマルチメディア推薦サービスを提供している場合、ビデオ推薦用の1つのプロジェクトと音楽推薦用の別のプロジェクトを作成できます。 | BYOC"
type: origin
token: T8EbweuboiV1TRkLxVCcuduhn5b
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - projects
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases

---

import Admonition from '@theme/Admonition';


# プロジェクトの管理

Zilliz Cloudでは、プロジェクトは組織内の論理的なコンテナとして機能し、クラスターや関連リソースをグループ化します。ビジネスのさまざまな側面に合わせた複数のプロジェクトを作成できます。たとえば、会社がマルチメディア推薦サービスを提供している場合、ビデオ推薦用の1つのプロジェクトと音楽推薦用の別のプロジェクトを作成できます。

このガイドでは、プロジェクトを管理する手順を説明します。

## プロジェクトを見る{#view-projects}

組織に参加すると、組織内のすべてのプロジェクトのリストを閲覧可能になります。

![view-projects-byoc](/img/view-projects-byoc.png)

## プロジェクトを作成する{#create-a-project}

プロジェクトを作成するには、[組織オーナー](./organization-users)である必要があります。

プロジェクトを作成すると、自動的にそのプロジェクトの[プロジェクト管理者](./project-users)になります。

<Admonition type="info" icon="📘" title="ノート">

<p>各組織で最大100件のプロジェクトを作成できます。</p>

</Admonition>

![create-project-byoc](/img/create-project-byoc.png)

## プロジェクトの名前を変更する{#rename-a-project}

プロジェクトの名前を変更するには、[組織オーナー](./organization-users)である必要があります。

<Admonition type="info" icon="📘" title="ノート">

<p>各組織にはデフォルトプロジェクトが含まれています。デフォルトプロジェクトの名前は変更できません。</p>

</Admonition>

![rename-project-byoc](/img/rename-project-byoc.png)

## プロジェクトを削除{#delete-a-project}

プロジェクトを削除するには、[組織オーナー](./organization-users)である必要があります。

<Admonition type="info" icon="📘" title="ノート">

<p>各組織にはデフォルトプロジェクトが含まれています。デフォルトプロジェクトは削除できません。</p>

</Admonition>

![delete-project-byoc](/img/delete-project-byoc.png)

