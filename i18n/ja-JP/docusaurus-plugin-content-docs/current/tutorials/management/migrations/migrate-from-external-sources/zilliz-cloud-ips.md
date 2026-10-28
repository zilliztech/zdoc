---
title: "Zilliz Cloud の IP アドレス | Cloud"
slug: /zilliz-cloud-ips
sidebar_label: "Zilliz Cloud の IP アドレス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、一連の固定 IP アドレスを使用してデータソースからデータを取得し、ターゲットクラスターに送信します。Zilliz Cloud がこの処理を実行できるようにするには、これらの IP アドレスをファイアウォールの許可リストに登録する必要があります | Cloud"
type: origin
token: KfgvwJKPDi8uDekl2aHcPOvgnSb
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud の IP アドレス

Zilliz Cloud は、一連の固定 IP アドレスを使用してデータソースからデータを取得し、ターゲットクラスターに送信します。Zilliz Cloud がこの処理を実行できるようにするには、これらの IP アドレスをファイアウォールの許可リストに登録する必要があります。

- Zilliz Cloud のサービス IP アドレス

- ターゲットクラスターが存在するクラウドリージョンの IP アドレス

## Zilliz Cloud のサービス IP アドレス\{#zilliz-cloud-service-ip-addresses}

<RegionIps scope="service" />

## ターゲットクラスターのリージョン IP アドレス\{#target-cluster-region-ip-addresses}

ターゲット Zilliz Cloud クラスターのクラウドサービスプロバイダーおよびリージョンに対応する IP アドレスを許可リストに登録します。

### AWS\{#aws}

<RegionIps provider="aws" />

### GCP\{#gcp}

<RegionIps provider="gcp" />

### Azure\{#azure}

<RegionIps provider="azure" />

