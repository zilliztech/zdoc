---
title: "Slow Logs の設定 | Cloud"
slug: /configure-slow-logs
sidebar_label: "Slow Logs の設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud における Slow logs のライフサイクル全体（有効化、設定の調整、無効化）について説明します。 | Cloud"
type: origin
token: VcI1wZ5mQiGqdPkCzHccj1RLnbd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Slow Logs の設定

このガイドでは、Zilliz Cloud における Slow logs のライフサイクル全体（有効化、設定の調整、無効化）について説明します。

<Admonition type="info" icon="📘" title="注意">

- このリリースでは、低速な Search、HybridSearch、および Query リクエストが記録されます。

- Slow logs は、**Enterprise** プロジェクト上の **Dedicated** cluster でのみ利用できます。お使いの cluster が別のプランまたは cluster タイプの場合は、アップグレードを検討してください。

- Slow logs 機能は無料で利用できます。

</Admonition>

## 開始する前に\{#before-you-start}

- ターゲット cluster と同じリージョンに設定されたオブジェクトストレージ連携（AWS S3、Google Cloud Storage、または Azure Blob Storage）。設定手順については、[AWS S3 との連携](./integrate-with-aws-s3)、[Google Cloud Storage との連携](./integrate-with-gcp)、または [Azure Blob Storage との連携](./integrate-with-azure-blob-storage) を参照してください。

- プロジェクトに対する **Organization Owner**、**Project Admin**、または **Cluster Admin** 権限。必要な権限がない場合は、Zilliz Cloud 管理者にお問い合わせください。

## Slow logs を有効にする\{#enable-slow-logs}

<Supademo id="cmqhjlq7g139qqmz3vhol6saa" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) を開き、ターゲット cluster に移動します。

1. **Logs** タブをクリックします。

1. **Slow Logs** カードの **Configure** ボタンをクリックします。

1. Slow **Log Settings** ダイアログボックスで、以下の設定を構成します。

    - **Storage Integration**: ログファイルの配信先となる、連携済みのストレージバケットを選択します。

    - **Directory**: access logs を保存するための、バケット内のディレクトリを指定します。

    - **Threshold**: Slow log 収集のしきい値を指定します。実行時間がこの値を超える操作は Slow logs に記録されます。デフォルト値は 150 ms です。

1. **Save** をクリックします。

</Procedures>

## Slow log 設定を編集する\{#edit-slow-log-settings}

![Pj70wvma3hwRdubQdqucq7Zinnc](https://zdoc-images.s3.us-west-2.amazonaws.com/Pj70wvma3hwRdubQdqucq7Zinnc.png)

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) を開き、cluster に移動します。

1. **Logs** タブをクリックします。

1. **Edit** をクリックします。

1. 必要に応じて **Storage Integration**、**Directory**、または **Threshold** を調整します。

1. **Save** をクリックします。更新された設定は、新しいログエントリに対して直ちに有効になります。バケット内の既存のログファイルには影響しません。

</Procedures>

## Slow logs を無効にする\{#disable-slow-logs}

![AfQswQaVYh9qW7ba3sTcBI7qnfg](https://zdoc-images.s3.us-west-2.amazonaws.com/AfQswQaVYh9qW7ba3sTcBI7qnfg.png)

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) を開き、cluster に移動します。

1. **Logs** タブをクリックします。

1. **Disable** をクリックします。新しいログエントリの記録は直ちに停止します。既存のログファイルはバケット内に保持されます。

</Procedures>
