---
title: "FAQ：安全 | BYOC"
slug: /faq-security
sidebar_label: "FAQ：安全"
beta: FALSE
notebook: FALSE
description: " | BYOC"
type: origin
token: YVAzwqHdti7uHSkZL6icsY7hnpe
sidebar_position: 12

---

# FAQ：安全

本文涵盖了在使用 Zilliz Cloud 平台期间与您的数据安全相关的问题，包括证书授权机构、证书有效期、检查证书是否过期的相关步骤、支持的传输层协议（TLS）版本及相应的鉴权方法。

## 目录

- [Zilliz Cloud 集群 Endpoint 的证书由哪个机构颁发？](#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints)
- [Zilliz Cloud 集群 Endpoint 的证书有效期有多长？](#what-is-the-certificate-validity-period-for-zilliz-cloud-cluster?)
- [如何检查我的 Zilliz Cloud 集群 Endpoint 相关证书是否已过期？](#how-can-i-check-whether-a-certificate-expires)
- [Zilliz Cloud 支持的 TLS 版本有哪些？](#what-tls-versions-are-supported-on-zilliz-cloud)
- [Zilliz Cloud 支持 mTLS 吗？](#does-zilliz-cloud-support-mtls)

## 问答




### Zilliz Cloud 集群 Endpoint 的证书由哪个机构颁发？ \{#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints}

Zilliz Cloud 使用 Let's Encrypt 为托管在阿里云、腾讯云及亚马逊云科技等云服务提供商上的集群颁发和签名证书。

### Zilliz Cloud 集群 Endpoint 的证书有效期有多长？ \{#what-is-the-certificate-validity-period-for-zilliz-cloud-cluster?}

为 Zilliz Cloud 集群颁发的证书有效期为颁发之日起 90 天。Zilliz 会在证书过期前 30 天自动为证书续期。

### 如何检查我的 Zilliz Cloud 集群 Endpoint 相关证书是否已过期？ \{#how-can-i-check-whether-a-certificate-expires}

您可以使用如下命令检查您的 Zilliz Cloud 集群证书是否已过期。在如下命令中假设您的集群托管在阿里云上，其实例 ID 为 `inxx-xxxxxxxxxxxxxxxxx`。请确保目标实例 URL 以正确的端口号结尾，如 `:443`。

```bash
echo | openssl s_client -showcerts -connect inxx-xxxxxxxxxxxxxxxxx.ali-cn-hangzhou.vectordb.zillizcloud.com:443 2> /dev/null | openssl x509 -noout -enddate
```

命令输出如下：

```bash
notAfter=Jul  7 06:58:17 2025 GMT
```

### Zilliz Cloud 支持的 TLS 版本有哪些？ \{#what-tls-versions-are-supported-on-zilliz-cloud}

基于安全原因考虑，Zilliz Cloud 仅支持 TLS 1.2 和 TLS 1.2+。不支持 TLS 1.0 和 TLS 1.1。

### Zilliz Cloud 支持 mTLS 吗？ \{#does-zilliz-cloud-support-mtls}

Zilliz Cloud 仅支持单向 TLS 鉴权。暂不支持双向 TLS 鉴权。