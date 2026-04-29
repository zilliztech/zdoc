---
title: "アクセスログの構成 | Cloud"
slug: /configure-access-logs
sidebar_key: configure-access-logs
sidebar_label: "アクセスログの構成"
beta: PUBLIC
notebook: FALSE
description: "このガイドでは、Zilliz Cloud におけるアクセスログの有効化、設定調整、無効化を含む完全なライフサイクルについて説明します。 | Cloud"
type: origin
token: QPgEwd4qziOa5RkgJR2c9gpnn3b
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - アクセス
  - ログ
  - 構成

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# アクセスログの設定

このガイドでは、Zilliz Cloud におけるアクセスログのライフサイクル全体（有効化、設定の調整、無効化）について説明します。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>このリリースでは、検索またはクエリクラスのアクション（Search、HybridSearch、Query）のみがログに記録されます。全アクションリストのサポートは今後のリリースで予定されています。</p></li>
<li><p>このリリースでは、監査ログとアクセスログは相互排他であり、同時に有効にできるのは一方のみです。</p></li>
<li><p>アクセスログは、<strong>Enterprise</strong> プロジェクト上の <strong>Dedicated</strong> クラスターでのみ利用可能です。クラスターが異なるプランまたはクラスタータイプにある場合は、アップグレードを検討してください。</p></li>
</ul>

</Admonition>

## 始める前に\{#before-you-start}

- ターゲットクラスターと同じリージョンに構成されたオブジェクトストレージ統合（AWS S3、Google Cloud Storage、または Azure Blob Storage）。セットアップ手順については、[AWS S3 との統合](./integrate-with-aws-s3)、[Google Cloud Storage との統合](./integrate-with-gcp)、または [Azure Blob Storage との統合](./integrate-with-azure-blob-storage) を参照してください。

- プロジェクトに対する **組織オーナー**、**プロジェクト管理者**、または **クラスター管理者** の権限。必要な権限を持っていない場合は、Zilliz Cloud 管理者にお問い合わせください。

## アクセスログを有効にする\{#enable-access-logs}

<Supademo id="cmn5r1yif3u0fz3qmiev350yz" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) を開き、ターゲットクラスターに移動します。

1. クラスター設定ページで、**Access Log** タブをクリックし、次に **Enable** をクリックします。

1. **Access Log Settings** ダイアログボックスで、以下の設定を行います：

    - **ストレージ統合**: ログファイルが配信される統合ストレージバケットを選択します。

    - **Directory**: アクセスログを保存するためのバケット内のディレクトリを指定します。

    - **Sampling Rate**: ログに記録するクエリの割合を設定します。100% のレートにすると、すべての操作がキャプチャされます。大量のワークロードの場合、低いレート（例：1%）にすることで、統計的有意性を保ちながらストレージコストを削減できます。

    - **Actions**: アクセスログエントリとして記録される操作タイプ（例：Search または HybridSearch）を指定します。

    - **Output Fields**: オブジェクトストレージに書き込まれる各アクセスログエントリに含まれるメタデータフィールドを指定します。**Always included** としてマークされたフィールドはすべてのエントリに対して記録され、選択されたフィールドは追加でキャプチャされます。

1. **Save** をクリックします。ログファイルは数分以内にバケットに表示され始め、パス規約 `/<クラスターID>/Access/<Date>/<HH:MM:SS>-<UUID>.log` に従います。

</Procedures>

## アクセスログ設定を編集する\{#edit-access-log-settings}

アクセスログを無効にすることなく、サンプリングレートや出力フィールドをいつでも調整できます。

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) を開き、クラスターに移動します。

1. クラスター設定ページで、**Access Log** タブをクリックします。

1. **Edit** をクリックします。

1. 必要に応じて **Sampling Rate** または **Output Fields** を調整します。

1. **Save** をクリックします。更新された設定は、新しいログエントリに対して直ちに有効になります。バケット内の既存のログファイルには影響しません。

</Procedures>

## アクセスログを無効にする\{#disable-access-logs}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) を開き、クラスターに移動します。

1. クラスター設定ページで、**Access Log** タブをクリックします。

1. **Disable** をクリックします。新しいログエントリは直ちに停止します。既存のログファイルはバケットに残ります。アクセスログの 請求 は、無効化されると停止します。

</Procedures>