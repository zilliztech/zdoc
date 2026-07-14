---
title: "Slow Logs を設定する | BYOC"
slug: /configure-slow-logs
sidebar_label: "Slow Logs を設定する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud における slow logs のライフサイクル全体（有効化、設定の調整、無効化）について説明します。 | BYOC"
type: origin
token: VcI1wZ5mQiGqdPkCzHccj1RLnbd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Slow Logs を設定する

このガイドでは、Zilliz Cloud における slow logs のライフサイクル全体（有効化、設定の調整、無効化）について説明します。

<Admonition type="info" icon="📘" title="注記">

- このリリースでは、低速な Search、HybridSearch、および Query リクエストが記録されます。

- slow logs は、**Enterprise** プロジェクト上の **Dedicated** クラスターでのみ利用できます。お使いのクラスターが別のプランまたはクラスタータイプの場合は、アップグレードを検討してください。

- Slow logs 機能は無料で利用できます。

</Admonition>

## 始める前に\{#before-you-start}

- 対象クラスターと同じリージョンに設定されたオブジェクトストレージ連携（AWS S3、Google Cloud Storage、または Azure Blob Storage）。

- プロジェクトに対する **Organization Owner**、**Project Admin**、または **Cluster Admin** 権限。必要な権限がない場合は、Zilliz Cloud 管理者に連絡してください。

## slow logs を有効にする\{#enable-slow-logs}

<Supademo id="cmqhjlq7g139qqmz3vhol6saa" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) を開き、対象のクラスターに移動します。

1. **Logs** タブをクリックします。

1. **Slow Logs** カードの **Configure** ボタンをクリックします。

1. Slow **Log Settings** ダイアログボックスで、次の設定を構成します。

    - **Storage Integration**: ログファイルの配信先となる、連携済みのストレージバケットを選択します。

    - **Directory**: access logs を保存するバケット内のディレクトリを指定します。

    - **Threshold**: slow log 収集のしきい値を指定します。実行時間がこの値を超える操作は slow logs に記録されます。デフォルト値は 150 ms です。

1. **Save** をクリックします。

</Procedures>

## slow log 設定を編集する\{#edit-slow-log-settings}

![Pj70wvma3hwRdubQdqucq7Zinnc](https://zdoc-images.s3.us-west-2.amazonaws.com/Pj70wvma3hwRdubQdqucq7Zinnc.png)

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) を開き、クラスターに移動します。

1. **Logs** タブをクリックします。

1. **Edit** をクリックします。

1. 必要に応じて **Storage Integration**、**Directory**、または **Threshold** を調整します。

1. **Save** をクリックします。更新された設定は、新しいログエントリに対してすぐに有効になります。バケット内の既存のログファイルには影響しません。

</Procedures>

## slow logs を無効にする\{#disable-slow-logs}

![AfQswQaVYh9qW7ba3sTcBI7qnfg](https://zdoc-images.s3.us-west-2.amazonaws.com/AfQswQaVYh9qW7ba3sTcBI7qnfg.png)

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) を開き、クラスターに移動します。

1. **Logs** タブをクリックします。

1. **Disable** をクリックします。新しいログエントリの記録は直ちに停止します。既存のログファイルはバケット内に残ります。

</Procedures>
