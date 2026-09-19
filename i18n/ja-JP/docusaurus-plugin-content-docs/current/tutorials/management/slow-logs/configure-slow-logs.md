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

<Admonition type="info" title="Notes">

- このリリースでは、低速な Search、HybridSearch、および Query リクエストが記録されます。

- Slow logs are available only for **Dedicated** クラスター on **Enterprise** projects. If your クラスター is on a different plan or クラスター type, consider upgrading it.

- Slow logs 機能は無料で利用できます。

</Admonition>

## 開始する前に\{#before-you-start}

- An object storage integration (AWS S3, Google Cloud Storage, or Azure Blob Storage) configured in the same region as your target クラスター. For setup instructions, refer to [Integrate with AWS S3](./integrate-with-aws-s3), [Integrate with Google Cloud Storage](./integrate-with-gcp), or [Integrate with Azure Blob Storage](./integrate-with-azure-blob-storage).

- **Organization Owner**, **Project Admin**, or **クラスター Admin** permissions for the project. If you do not have the required permissions, contact your Zilliz Cloud administrator.

## Slow logs を有効にする\{#enable-slow-logs}

<Supademo id="cmqhjlq7g139qqmz3vhol6saa" title=""  />

<Procedures>

1. Open the [Zilliz Cloud console](https://cloud.zilliz.com/login) and navigate to your target クラスター.

1. **Logs** タブをクリックします。

1. **Slow Logs** カードの **Configure** ボタンをクリックします。

1. Slow **Log Settings** ダイアログボックスで、以下の設定を構成します。

    - **Storage Integration**: ログファイルの配信先となる、連携済みのストレージバケットを選択します。

    - **Directory**: access logs を保存するための、バケット内のディレクトリを指定します。

    - **Threshold**: Specify the threshold for slow log コレクション. Operations whose execution time exceeds this value are recorded in slow logs. The default value is 150 ms.

1. **Save** をクリックします。

</Procedures>

## Slow log 設定を編集する\{#edit-slow-log-settings}

![Pj70wvma3hwRdubQdqucq7Zinnc](https://zdoc-images.s3.us-west-2.amazonaws.com/Pj70wvma3hwRdubQdqucq7Zinnc.png)

<Procedures>

1. Open the [Zilliz Cloud console](https://cloud.zilliz.com/login) and navigate to your クラスター.

1. **Logs** タブをクリックします。

1. **Edit** をクリックします。

1. 必要に応じて **Storage Integration**、**Directory**、または **Threshold** を調整します。

1. **Save** をクリックします。更新された設定は、新しいログエントリに対して直ちに有効になります。バケット内の既存のログファイルには影響しません。

</Procedures>

## Slow logs を無効にする\{#disable-slow-logs}

![AfQswQaVYh9qW7ba3sTcBI7qnfg](https://zdoc-images.s3.us-west-2.amazonaws.com/AfQswQaVYh9qW7ba3sTcBI7qnfg.png)

<Procedures>

1. Open the [Zilliz Cloud console](https://cloud.zilliz.com/login) and navigate to your クラスター.

1. **Logs** タブをクリックします。

1. **Disable** をクリックします。新しいログエントリの記録は直ちに停止します。既存のログファイルはバケット内に保持されます。

</Procedures>
