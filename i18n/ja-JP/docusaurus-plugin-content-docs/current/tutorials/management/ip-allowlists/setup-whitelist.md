---
title: "クラスター IP 許可リストの設定 | Cloud"
slug: /setup-whitelist
sidebar_label: "クラスター IP 許可リストの設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のクラスター IP 許可リストは、プロジェクトレベルで強力なセキュリティレイヤーとして機能し、指定したプロジェクト内のすべてのクラスターに適用されます。IP 許可リストを設定することで、プロジェクトのクラスターへのアクセスを特定の IP アドレスに限定でき、悪意のある攻撃のリスクを大幅に軽減できます。 | Cloud"
type: origin
token: FnS1wY0iuia4qgkMycVclZyHnOf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# クラスター IP 許可リストの設定

Zilliz Cloud のクラスター IP 許可リストは、プロジェクトレベルで強力なセキュリティレイヤーとして機能し、指定したプロジェクト内のすべてのクラスターに適用されます。IP 許可リストを設定することで、プロジェクトのクラスターへのアクセスを特定の IP アドレスに限定でき、悪意のある攻撃のリスクを大幅に軽減できます。

## 事前準備\{#before-you-start}

作業を開始する前に、以下の前提条件を満たしていることを確認してください。

- Zilliz Cloud にサインアップ済みであること。アカウント登録の詳細については、[Zilliz Cloud への登録](./register-with-zilliz-cloud) を参照してください。

- クラスター IP 許可リストを設定する組織またはプロジェクトの所有者であること。ロールと権限の詳細については、[プラットフォームユーザーの管理](./manage-platform-users) を参照してください。

## 手順\{#procedure}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. 許可リストを設定する組織およびプロジェクトに移動します。

1. 左側のナビゲーションペインで、**Security** > **クラスター IP 許可リスト** を選択します。

1. **Add IP Address** をクリックします。

1. 表示されるダイアログボックスで、**IP Address (CIDR)** と **Description** を指定します。

    各フィールドの説明は次のとおりです。

    | **フィールド** | **説明** |
    | --- | --- |
    | IP Address (CIDR) | 許可リストに追加する IP アドレスまたは CIDR ブロックを指定します。CIDR ブロックは最大 100 個まで追加できます。値の例: 192.168.1.1/20. |
    | Description | 許可リストに追加する IP アドレスまたは CIDR ブロックに関する説明を入力します。 |

1. **Add** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="📘 Notes">

- 許可リストにエントリが登録されていない場合、Zilliz Cloud はすべての IP アドレスからのアクセスを許可します。

- CIDR ブロックを追加すると、クラスターへのアクセスはそのブロック内の IP アドレスからのみに制限されます。

- 0.0.0.0/0 を追加した場合、許可リストが空の状態と同じ扱いになります。

</Admonition>

![whitelist-ip-access](https://zdoc-images.s3.us-west-2.amazonaws.com/whitelist-ip-access.png "whitelist-ip-access")

## 関連トピック\{#related-topics}

- [API キー](./manage-api-keys)

- [クラスターの認証情報（コンソール）](./cluster-credentials)

- [PrivateLink の設定（AWS）](./setup-a-private-link-aws)

- [Private Service Connect の設定（GCP）](./setup-a-private-link-gcp)

- [Private Link の設定（Azure）](./setup-a-private-link-azure)

