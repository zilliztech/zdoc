---
title: "FAQ: Security | CLOUD"
slug: /faq-security
sidebar_label: "FAQ: Security"
beta: FALSE
notebook: FALSE
description: "This topic covers potential issues related to data security on the Zilliz Cloud platform, including certificate authority, certificate validity period, procedures for checking certificate expiration, supported Transport Layer Security (TLS) versions, and authentication methods. | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 14

---

# FAQ: Security

This topic covers potential issues related to data security on the Zilliz Cloud platform, including certificate authority, certificate validity period, procedures for checking certificate expiration, supported Transport Layer Security (TLS) versions, and authentication methods.

## Contents

- [What is the certificate authority for Zilliz Cloud cluster endpoints?](#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints)
- [What is the certificate validity period for my Zilliz Cloud cluster?](#what-is-the-certificate-validity-period-for-my-zilliz-cloud-cluster)
- [How can I check whether a certificate expires?](#how-can-i-check-whether-a-certificate-expires)
- [Which TLS versions are supported on Zilliz Cloud?](#which-tls-versions-are-supported-on-zilliz-cloud)
- [Does Zilliz Cloud support mTLS?](#does-zilliz-cloud-support-mtls)

## FAQs




### What is the certificate authority for Zilliz Cloud cluster endpoints?{#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints}

Zilliz Cloud uses **Let's Encrypt** to issue and sign the certificates for Zilliz Cloud clusters hosted on AWS, Google Cloud Platform (GCP), and Microsoft Azure. 

Additionally, Zilliz Cloud employs **AWS Certificate Manager (ACM)** to issue and rotate certificates for Zilliz Cloud clusters on AWS.

### What is the certificate validity period for my Zilliz Cloud cluster?{#what-is-the-certificate-validity-period-for-my-zilliz-cloud-cluster}

The certificate issued for any of your Zilliz Cloud clusters will be valid for **90 days** from the date of issue and will be automatically rotated **30 days** before the expiration date.

### How can I check whether a certificate expires?{#how-can-i-check-whether-a-certificate-expires}

You can run the following command to check whether a Zilliz Cloud cluster's certificate expires. 

The following example command assumes that you have created a cluster in GCP and that its instance ID is `inxx-xxxxxxxxxxxxxxxxx`. Ensure that the target cluster endpoint ends with the correct port number, such as `:443`.

```bash
echo | openssl s_client -showcerts -connect inxx-xxxxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com:443 2> /dev/null | openssl x509 -noout -enddate
```

The command output would be similar to the following:

```bash
notAfter=Jul  7 06:58:17 2025 GMT
```

### Which TLS versions are supported on Zilliz Cloud?{#which-tls-versions-are-supported-on-zilliz-cloud}

For security reasons, Zilliz Cloud supports only **TLS 1.2** and **TLS 1.2+**. TLS 1.0 and TLS 1.1 are not supported.

### Does Zilliz Cloud support mTLS?{#does-zilliz-cloud-support-mtls}

Zilliz Cloud currently supports only one-way TLS authentication and does not support two-way TLS authentication.