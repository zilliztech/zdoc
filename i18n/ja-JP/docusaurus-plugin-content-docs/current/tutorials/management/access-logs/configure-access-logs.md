---
title: "Access Logs を設定する | Cloud"
slug: /configure-access-logs
sidebar_label: "Access Logs を設定する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud における Access Logs のライフサイクル全体（有効化、設定の調整、無効化）について説明します。 | Cloud"
type: origin
token: QPgEwd4qziOa5RkgJR2c9gpnn3b
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Access Logs を設定する

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上、および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

このガイドでは、Zilliz Cloud における Access Logs のライフサイクル全体、すなわち有効化、設定の調整、無効化について説明します。

<Admonition type="info" icon="📘" title="注意">

- このリリースでは、検索またはクエリ系のアクションのみがログに記録されます: Search、HybridSearch、Query。すべてのアクション一覧のサポートは、今後のリリースで予定されています。

- このリリースでは、Audit log と Access log は相互排他的であり、一度に有効化できるのはどちらか一方のみです。

</Admonition>

## 始める前に\{#before-you-start}

- 対象のクラスターと同じリージョンに設定されたオブジェクトストレージ統合（AWS S3、Google Cloud Storage、または Azure Blob Storage）。セットアップ手順については、[AWS S3 と統合する](./integrate-with-aws-s3)、[Google Cloud Storage と統合する](./integrate-with-gcp)、または [Azure Blob Storage と統合する](./integrate-with-azure-blob-storage) を参照してください。

- プロジェクトに対する **Organization Owner**、**Project Admin**、または **Cluster Admin** 権限。必要な権限がない場合は、Zilliz Cloud 管理者に連絡してください。

## Access Logs を有効化する\{#enable-access-logs}

<Supademo id="cmn5r1yif3u0fz3qmiev350yz" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)を開き、対象のクラスターに移動します。

1. クラスター設定ページで **Access Log** タブをクリックし、**Enable** をクリックします。

1. **Access Log Settings** ダイアログボックスで、以下の設定を構成します。

    - **Storage Integration**: ログファイルの配信先となる、統合済みのストレージバケットを選択します。

    - **Directory**: Access Logs を保存するバケット内のディレクトリを指定します。

    - **Sampling Rate**: ログに記録するクエリの割合を設定します。100% に設定すると、すべての操作が記録されます。高トラフィックのワークロードでは、より低いレート（たとえば 1%）にすることで、統計的な有意性を保ちながらストレージコストを削減できます。

    - **Actions**: どの操作タイプ（たとえば Search や HybridSearch）を Access Log エントリとして記録するかを指定します。

    - **Output Fields**: オブジェクトストレージに書き込まれる各 Access Log エントリに含めるメタデータフィールドを指定します。**Always included** とマークされたフィールドはすべてのエントリに記録され、選択したフィールドは追加で取得されます。

1. **Save** をクリックします。数分以内に、`/<Cluster ID>/Access/<Date>/<HH:MM:SS>-<UUID>.log` というパス規則に従って、ログファイルがバケットに表示され始めます。

</Procedures>

## Access Log の設定を編集する\{#edit-access-log-settings}

Access Logs を無効化することなく、Sampling Rate と Output Fields はいつでも調整できます。

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)を開き、クラスターに移動します。

1. クラスター設定ページで **Access Log** タブをクリックします。

1. **Edit** をクリックします。

1. 必要に応じて **Sampling Rate** または **Output Fields** を調整します。

1. **Save** をクリックします。更新した設定は、新しいログエントリに対して即座に有効になります。バケット内の既存のログファイルには影響しません。

</Procedures>

## Access Logs を無効化する\{#disable-access-logs}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)を開き、クラスターに移動します。

1. クラスター設定ページで **Access Log** タブをクリックします。

1. **Disable** をクリックします。新しいログエントリは直ちに停止します。既存のログファイルはバケットに残ります。Access Logs の課金は、無効化されると停止します。

</Procedures>
