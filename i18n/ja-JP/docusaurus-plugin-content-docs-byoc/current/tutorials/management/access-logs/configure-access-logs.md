---
title: "アクセスログを設定する | BYOC"
slug: /configure-access-logs
sidebar_label: "アクセスログを設定する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud におけるアクセスログのライフサイクル全体（有効化、設定調整、無効化）を説明します。 | BYOC"
type: origin
token: QPgEwd4qziOa5RkgJR2c9gpnn3b
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# アクセスログを設定する

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

このガイドでは、Zilliz Cloud におけるアクセスログのライフサイクル全体、つまり有効化、設定調整、無効化について説明します。

<Admonition type="info" icon="📘" title="注意">

- このリリースでは、検索系またはクエリ系のアクションのみがログに記録されます: Search、HybridSearch、Query。アクション一覧全体のサポートは今後のリリースで予定されています。

- このリリースでは、監査ログとアクセスログは相互に排他的です。つまり、一度に有効化できるのはいずれか一方のみです。

</Admonition>

## 始める前に\{#before-you-start}

- 対象クラスターと同じリージョンに設定されたオブジェクトストレージ統合（AWS S3、Google Cloud Storage、または Azure Blob Storage）。

- プロジェクトに対する **Organization Owner**、**Project Admin**、または **Cluster Admin** 権限。必要な権限がない場合は、Zilliz Cloud 管理者にお問い合わせください。

## アクセスログを有効にする\{#enable-access-logs}

<Supademo id="cmn5r1yif3u0fz3qmiev350yz" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)を開き、対象のクラスターに移動します。

1. クラスター設定ページで **Access Log** タブをクリックし、**Enable** をクリックします。

1. **Access Log Settings** ダイアログボックスで、以下の設定を構成します。

    - **Storage Integration**: ログファイルの配信先となる、統合済みのストレージバケットを選択します。

    - **Directory**: アクセスログを保存するバケット内のディレクトリを指定します。

    - **Sampling Rate**: ログに記録するクエリの割合を設定します。100% にすると、すべての操作が記録されます。高トラフィックのワークロードでは、より低い割合（たとえば 1%）にすることで、統計的な有意性を保ちながらストレージコストを削減できます。

    - **Actions**: アクセスログエントリとして記録する操作タイプ（たとえば Search や HybridSearch）を指定します。

    - **Output Fields**: オブジェクトストレージに書き込まれる各アクセスログエントリに含めるメタデータフィールドを指定します。**Always included** とマークされたフィールドはすべてのエントリに記録され、選択したフィールドはそれに加えて取得されます。

1. **Save** をクリックします。ログファイルは数分以内に、`/<Cluster ID>/Access/<Date>/<HH:MM:SS>-<UUID>.log` のパス規則に従ってバケットに表示され始めます。

</Procedures>

## アクセスログ設定を編集する\{#edit-access-log-settings}

アクセスログを無効化しなくても、Sampling Rate と Output Fields はいつでも調整できます。

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)を開き、クラスターに移動します。

1. クラスター設定ページで **Access Log** タブをクリックします。

1. **Edit** をクリックします。

1. 必要に応じて **Sampling Rate** または **Output Fields** を調整します。

1. **Save** をクリックします。更新された設定は、新しいログエントリに対して即座に反映されます。バケット内の既存のログファイルには影響しません。

</Procedures>

## アクセスログを無効にする\{#disable-access-logs}

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)を開き、クラスターに移動します。

1. クラスター設定ページで **Access Log** タブをクリックします。

1. **Disable** をクリックします。新しいログエントリは即座に停止します。既存のログファイルはバケットに残ります。Access Logs の課金は、無効化されると停止します。

</Procedures>
