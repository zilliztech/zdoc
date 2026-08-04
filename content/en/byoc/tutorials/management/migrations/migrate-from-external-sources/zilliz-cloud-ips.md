---
title: "Zilliz Cloud IPs | BYOC"
slug: /zilliz-cloud-ips
sidebar_label: "Zilliz Cloud IP Addresses"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud pulls data from your data sources and sends it to target clusters using a set of fixed IP addresses. To ensure that Zilliz Cloud can do this, you must safelist these IP addresses in your firewall | BYOC"
type: origin
token: KfgvwJKPDi8uDekl2aHcPOvgnSb
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud IPs

Zilliz Cloud pulls data from your data sources and sends it to target clusters using a set of fixed IP addresses. To ensure that Zilliz Cloud can do this, you must safelist these IP addresses in your firewall:

- Zilliz Cloud service IP addresses

- The IP addresses for the cloud region where your target cluster resides

## Zilliz Cloud service IP addresses\{#zilliz-cloud-service-ip-addresses}

These IP addresses are used by Zilliz Cloud to provide services. Ensure that these are added to your firewall's allowlist.

| Region | Location | IP Addresses (CIDR) |
| --- | --- | --- |
| us-west-2 | Oregon, USA | `54.200.111.111`, `34.218.171.123` |

## Target cluster region IP addresses\{#target-cluster-region-ip-addresses}

Safelist the IP addresses corresponding to the cloud service provider and region of your target Zilliz Cloud cluster.

### AWS\{#aws}

| Region | Location | IP Addresses (CIDR) |
| --- | --- | --- |
| us-west-2 | Oregon, USA | `54.200.111.111`, `34.218.171.123` |
| us-east-1 | N. Virginia, USA | `44.208.236.92` |
| us-east-2 | Ohio, USA | `18.190.127.133` |
| ap-southeast-1 | Singapore | `13.251.167.154`, `3.0.159.148` |
| ap-northeast-1 | Tokyo, Japan | `35.72.252.126` |
| eu-central-1 | Frankfurt, Germany | `18.158.52.65`, `3.121.11.160` |
| eu-west-1 | Ireland | `54.76.194.38`, `99.81.179.135`, `3.248.62.149`, `52.16.225.156` |
| eu-west-2 | London, United Kingdom | `35.179.44.17`, `3.134.92.161`, `16.61.161.137`, `13.135.182.79` |
| ca-central-1 | Canada (Central) | `15.157.245.36`, `52.60.120.239`, `15.157.14.152` |
| ap-sourtheast-2 | Sydney, Australia | `13.210.191.123`, `52.62.215.167` |
| ap-northeast-2 | Seoul, Korea | `43.200.197.223`, `54.116.65.71`, `43.200.30.237`, `13.125.81.204` |

### GCP\{#gcp}

| Region | Location | IP Addresses (CIDR) |
| --- | --- | --- |
| us-west1 | Oregon, USA | `34.168.252.102`, `34.83.176.23`, `35.247.80.67`, `35.227.139.83`,<br/>`34.168.123.225`, `35.247.17.192`, `34.105.17.34` |
| us-east4 | Virginia, USA | `35.245.190.186`, `35.245.51.241` |
| us-central1 | Iowa, USA | `34.49.219.2`, `34.98.66.206`, `35.190.6.159`, `34.149.186.202` |
| asia-southeast1 | Singapore | `34.87.102.210`, `35.197.139.186` |
| europe-west3 | Frankfurt, Germany | `34.107.41.158`, `34.141.61.171` |

### Azure\{#azure}

| Region | Location | IP Addresses (CIDR) |
| --- | --- | --- |
| East US | Virginia, USA | `52.152.137.114` |
| East US 2 | Virginia, USA | `135.18.170.251` |
| Central US | Iowa, USA | `52.173.197.113` |
| Germany West Central | Frankfurt, Germany | `4.184.247.193` |
| North Europe | Ireland | `4.207.64.80`, `13.79.36.108` |
| Central India | Pune, India | `98.70.222.135` |

