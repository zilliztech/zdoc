---
title: "クラスター IP 許可リストの設定 | Cloud"
slug: /setup-whitelist
sidebar_label: "クラスター IP 許可リストの設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のクラスター IP 許可リストは、プロジェクトレベルで堅牢なセキュリティレイヤーとして機能し、そのメリットを指定したプロジェクト内のすべてのクラスターに拡張します。IP 許可リストを実装することで、プロジェクトのクラスターへのアクセスを選択した IP アドレス群のみに効果的に絞り込み、悪意のある攻撃のリスクを大幅に軽減できます。 | Cloud"
type: origin
token: FnS1wY0iuia4qgkMycVclZyHnOf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# クラスター IP 許可リストの設定

Zilliz Cloud のクラスター IP 許可リストは、プロジェクトレベルで堅牢なセキュリティレイヤーとして機能し、そのメリットを指定したプロジェクト内のすべてのクラスターに拡張します。IP 許可リストを実装することで、プロジェクトのクラスターへのアクセスを選択した IP アドレス群のみに効果的に絞り込み、悪意のある攻撃のリスクを大幅に軽減できます。

## 始める前に\{#before-you-start}

先に進む前に、以下の前提条件を満たしていることを確認してください。

- Zilliz Cloud にサインアップしていること。アカウント登録方法については、[Zilliz Cloud への登録](./register-with-zilliz-cloud)を参照してください。

- クラスター IP 許可リストを設定したい組織またはプロジェクトの所有者であること。ロールと権限については、[組織ユーザーの管理](./organization-users)および [プロジェクトユーザーの管理](./project-users)を参照してください。

## 手順\{#procedure}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. 許可リストを設定する対象の組織とプロジェクトに移動します。

1. 左側のナビゲーションペインで、**Security** > **Cluster IP Allowlist** を選択します。

1. **Add IP Address** をクリックします。

1. 表示されるダイアログボックスで、**IP Address (CIDR)** と **Description** を指定します。

    以下の表は各フィールドを説明しています。

    | **Field** | **Description** |
    | --- | --- |
    | IP Address (CIDR) | 許可リストに追加する IP アドレスまたは CIDR ブロック。最大 100 個の CIDR ブロックを指定できます。例: 192.168.1.1/20。 |
    | Description | 許可リストに追加する IP アドレスまたは CIDR ブロックの説明。 |

1. **Add** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="📘 Notes">

- 許可リストにエントリがない場合、Zilliz Cloud は任意の IP アドレスからのアクセスを許可します。

- CIDR ブロックを追加すると、クラスターへのアクセスはそのブロック内の IP アドレスのみに制限されます。

- 0.0.0.0/0 を追加することは、許可リストを空にしている状態と同じです。

</Admonition>

![whitelist-ip-access](https://zdoc-images.s3.us-west-2.amazonaws.com/whitelist-ip-access.png "whitelist-ip-access")

## 関連トピック\{#related-topics}

- [API Keys](./manage-api-keys)

- [クラスター認証情報（コンソール）](./cluster-credentials)

- [PrivateLink の設定（AWS）](./setup-a-private-link-aws)

- [Private Service Connect の設定（GCP）](./setup-a-private-link-gcp)

- [Private Link の設定（Azure）](./setup-a-private-link-azure)

