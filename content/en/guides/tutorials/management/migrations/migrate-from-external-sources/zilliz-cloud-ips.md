---
title: "Zilliz Cloud IPs | Cloud"
slug: /zilliz-cloud-ips
sidebar_label: "Zilliz Cloud IP Addresses"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud pulls data from your data sources and sends it to target clusters using a set of fixed IP addresses. To ensure that Zilliz Cloud can do this, you must safelist these IP addresses in your firewall | Cloud"
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

<RegionIps scope="service" />

## Target cluster region IP addresses\{#target-cluster-region-ip-addresses}

Safelist the IP addresses corresponding to the cloud service provider and region of your target Zilliz Cloud cluster.

### AWS\{#aws}

<RegionIps provider="aws" />

### GCP\{#gcp}

<RegionIps provider="gcp" />

### Azure\{#azure}

<RegionIps provider="azure" />

