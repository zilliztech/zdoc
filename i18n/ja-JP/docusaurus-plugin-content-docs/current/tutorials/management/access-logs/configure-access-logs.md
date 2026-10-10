---
title: "アクセスログの構成 | Cloud"
slug: /configure-access-logs
sidebar_label: "アクセスログの構成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud におけるアクセスログのライフサイクル全体（有効化、設定の調整、無効化）について説明します。 | Cloud"
type: origin
token: QPgEwd4qziOa5RkgJR2c9gpnn3b
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# アクセスログの構成

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイでのみ利用できます。

</FeatureNote>

このガイドでは、Zilliz Cloud におけるアクセスログのライフサイクル全体（有効化、設定の調整、無効化）について説明します。

<Admonition type="info" title="Notes">

- このリリースでは、検索またはクエリに分類されるアクション（Search、HybridSearch、Query）のみがログに記録されます。すべてのアクションリストのサポートは、将来のリリースで計画されています。

- このリリースでは、監査ログとアクセスログは排他的な関係にあり、同時に有効化できるのはいずれか一方のみです。

</Admonition>

## 事前準備\{#before-you-start}

- 対象クラスターと同じリージョンに構成されたオブジェクトストレージ統合（AWS S3、Google Cloud Storage、Azure Blob Storage のいずれか）が存在すること。セットアップ手順については、[AWS S3 との統合](./integrate-with-aws-s3)、[Google Cloud Storage との統合](./integrate-with-gcp)、[Azure Blob Storage との統合](./integrate-with-azure-blob-storage) を参照してください。

- プロジェクトに対する **Organization Owner**、**Project Admin**、または **クラスター Admin** の権限を持っていること。必要な権限がない場合は、Zilliz Cloud 管理者にお問い合わせください。

## アクセスログを有効にする\{#enable-access-logs}

<Supademo id="cmn5r1yif3u0fz3qmiev350yz" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) を開き、対象のクラスターに移動します。

1. クラスター構成ページで **Access Log** タブをクリックし、続いて **Enable** をクリックします。

1. **Access Log Settings** ダイアログボックスで、以下の設定を構成します：

    - **Storage Integration**: ログファイルの配信先となる統合ストレージバケットを選択します。

    - **Directory**: アクセスログを保存するバケット内のディレクトリを指定します。

    - **Sampling Rate**: ログに記録するクエリの割合を設定します。100% の割合では、すべての操作がキャプチャされます。大量のワークロードでは、より低い割合（1% など）にすると、統計的な有意性を保ちながらストレージコストを削減できます。

    - **Actions**: どの操作タイプ（たとえば Search や HybridSearch）をアクセスログエントリとして記録するかを指定します。

    - **Output Fields**: オブジェクトストレージに書き込まれる各アクセスログエントリに含めるメタデータフィールドを指定します。**Always included** とマークされたフィールドはすべてのエントリで記録され、選択したフィールドが追加でキャプチャされます。

1. **Save** をクリックします。ログファイルは、数分以内に `/<Cluster ID>/Access/<Date>/<HH:MM:SS>-<UUID>.log` というパス規則に従ってバケットに表示され始めます。

</Procedures>

## アクセスログ設定を編集する\{#edit-access-log-settings}

アクセスログを無効化することなく、サンプリングレートと出力フィールドはいつでも調整できます。

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) を開き、対象のクラスターに移動します。

1. クラスター構成ページで **Access Log** タブをクリックします。

1. **Edit** をクリックします。

1. 必要に応じて **Sampling Rate** または **Output Fields** を調整します。

1. **Save** をクリックします。更新された設定は新しいログエントリに対して即座に反映されます。バケット内の既存のログファイルには影響しません。

</Procedures>

## アクセスログを無効にする\{#disable-access-logs}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) を開き、対象のクラスターに移動します。

1. クラスター構成ページで **Access Log** タブをクリックします。

1. **Disable** をクリックします。新しいログエントリは即座に停止します。既存のログファイルはバケットに残ります。無効化すると、アクセスログの課金は停止します。

</Procedures>
