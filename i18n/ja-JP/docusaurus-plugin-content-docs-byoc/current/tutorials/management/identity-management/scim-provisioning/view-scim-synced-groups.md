---
title: "SCIM 同期グループの表示 | BYOC"
slug: /view-scim-synced-groups
sidebar_label: "SCIM 同期グループの表示"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "SCIM プロビジョニングを設定すると、ID プロバイダー（IdP）からプロビジョニングされたグループが同期グループとして Zilliz Cloud に表示されます。これらのグループは Access Control で確認できます。 | BYOC"
type: origin
token: Er7Yw6Qnuiy8CBkDkH3cetOHnDf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# SCIM 同期グループの表示

SCIM プロビジョニングを設定すると、ID プロバイダー（IdP）からプロビジョニングされたグループが、同期グループとして Zilliz Cloud に表示されます。これらのグループは Access Control で確認できます。

SCIM 同期グループは、Zilliz Cloud では読み取り専用です。Zilliz Cloud で SCIM 同期グループを直接作成したり、そのグループにユーザーを追加・招待したり、メンバーシップを変更したりすることはできません。グループ名、メンバーシップ、ライフサイクルは IdP で管理してください。IdP は、それらの変更を SCIM を通じて Zilliz Cloud に同期します。

## 事前準備\{#before-you-start}

- [SCIM Provisioning の概要](./scim-provisioning-overview) を確認し、Zilliz Cloud 組織に対して SCIM プロビジョニングを設定済みであること。

- IdP から Zilliz Cloud に少なくとも 1 つのグループがプロビジョニングされていること。

## 同期グループの表示\{#view-synced-groups}

以下のインタラクティブデモでは、Zilliz Cloud で SCIM 同期グループの一覧を開く方法を説明します。

<Supademo id="cmseasko70twvqm25bstzowox" title=""  />

<Procedures>

1. 左側のナビゲーションペインで **Access Control** をクリックします。

1. **Groups** タブを開きます。

1. IdP からプロビジョニングされたグループがグループ一覧に表示されていることを確認します。

</Procedures>
