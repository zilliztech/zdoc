---
title: "Zilliz Cloud IP アドレス | BYOC"
slug: /zilliz-cloud-ips
sidebar_label: "Zilliz Cloud IP アドレス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は固定 IP アドレスのセットを使用して、データソースからデータを取得し、ターゲットクラスターに送信します。Zilliz Cloud がこれを実行できるようにするには、ファイアウォールでこれらの IP アドレスをセーフリストに追加する必要があります | BYOC"
type: origin
token: KfgvwJKPDi8uDekl2aHcPOvgnSb
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud IP アドレス

Zilliz Cloud は固定 IP アドレスのセットを使用して、データソースからデータを取得し、ターゲットクラスターに送信します。Zilliz Cloud がこれを実行できるようにするには、ファイアウォールで次の IP アドレスをセーフリストに追加する必要があります。

- Zilliz Cloud サービスの IP アドレス

- ターゲットクラスターが存在するクラウドリージョンの IP アドレス

## Zilliz Cloud サービスの IP アドレス\{#zilliz-cloud-service-ip-addresses}

これらの IP アドレスは、Zilliz Cloud がサービスを提供するために使用します。これらがファイアウォールの許可リストに追加されていることを確認してください。

| Region | Location | IP Addresses (CIDR) |
| --- | --- | --- |
| us-west-2 | 米国オレゴン | `54.200.111.111`, `34.218.171.123` |

## ターゲットクラスターリージョンの IP アドレス\{#target-cluster-region-ip-addresses}

ターゲット Zilliz Cloud クラスターのクラウドサービスプロバイダーおよびリージョンに対応する IP アドレスをセーフリストに追加してください。

### AWS\{#aws}

| Region | Location | IP Addresses (CIDR) |
| --- | --- | --- |
| us-west-2 | 米国オレゴン | `54.200.111.111`, `34.218.171.123` |
| us-east-1 | 米国バージニア北部 | `44.208.236.92` |
| us-east-2 | 米国オハイオ | `18.190.127.133` |
| ap-southeast-1 | シンガポール | `13.251.167.154`, `3.0.159.148` |
| ap-northeast-1 | 日本、東京 | `35.72.252.126` |
| eu-central-1 | ドイツ、フランクフルト | `18.158.52.65`, `3.121.11.160` |
| eu-west-1 | アイルランド | `54.76.194.38`, `99.81.179.135`, `3.248.62.149`, `52.16.225.156` |
| eu-west-2 | 英国、ロンドン | `35.179.44.17`, `3.134.92.161`, `16.61.161.137`, `13.135.182.79` |
| ca-central-1 | カナダ（中部） | `15.157.245.36`, `52.60.120.239`, `15.157.14.152` |
| ap-sourtheast-2 | オーストラリア、シドニー | `13.210.191.123`, `52.62.215.167` |
| ap-northeast-2 | 韓国、ソウル | `43.200.197.223`, `54.116.65.71`, `43.200.30.237`, `13.125.81.204` |

### GCP\{#gcp}

| Region | Location | IP Addresses (CIDR) |
| --- | --- | --- |
| us-west1 | 米国オレゴン | `34.168.252.102`, `34.83.176.23`, `35.247.80.67`, `35.227.139.83`,<br/>`34.168.123.225`, `35.247.17.192`, `34.105.17.34` |
| us-east4 | 米国バージニア | `35.245.190.186`, `35.245.51.241` |
| us-central1 | 米国アイオワ | `34.49.219.2`, `34.98.66.206`, `35.190.6.159`, `34.149.186.202` |
| asia-southeast1 | シンガポール | `34.87.102.210`, `35.197.139.186` |
| europe-west3 | ドイツ、フランクフルト | `34.107.41.158`, `34.141.61.171` |

### Azure\{#azure}

| Region | Location | IP Addresses (CIDR) |
| --- | --- | --- |
| East US | 米国バージニア | `52.152.137.114` |
| East US 2 | 米国バージニア | `135.18.170.251` |
| Central US | 米国アイオワ | `52.173.197.113` |
| Germany West Central | ドイツ、フランクフルト | `4.184.247.193` |
| North Europe | アイルランド | `4.207.64.80`, `13.79.36.108` |
| Central India | インド、プネ | `98.70.222.135` |

