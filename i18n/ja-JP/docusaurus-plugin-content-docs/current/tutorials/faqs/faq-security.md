---
title: "FAQ：セキュリティ | CLOUD"
slug: /faq-security
sidebar_label: "FAQ：セキュリティ"
beta: FALSE
notebook: FALSE
description: "このトピックでは、証明機関、証明書有効期限、証明書の有効期限確認手順、サポートされているトランスポートレイヤーセキュリティ（TLS）バージョン、および認証方法を含む、Zilliz Cloudプラットフォーム上のデータセキュリティに関連する潜在的な問題について説明しています。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 14

---

# FAQ：セキュリティ

このトピックでは、証明機関、証明書有効期限、証明書の有効期限確認手順、サポートされているトランスポートレイヤーセキュリティ（TLS）バージョン、および認証方法を含む、Zilliz Cloudプラットフォーム上のデータセキュリティに関連する潜在的な問題について説明しています。

## 目次

- [Zilliz Cloudクラスターエンドポイントの証明機関は？](#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints)
- [Zilliz Cloudクラスターの証明書有効期限は？](#what-is-the-certificate-validity-period-for-my-zilliz-cloud-cluster)
- [証明書が期限切れかどうかを確認するには？](#how-can-i-check-whether-a-certificate-expires)
- [Zilliz CloudでサポートされているTLSバージョンは？](#which-tls-versions-are-supported-on-zilliz-cloud)
- [Zilliz CloudはmTLSをサポートしていますか？](#does-zilliz-cloud-support-mtls)

## FAQ

### Zilliz Cloudクラスターエンドポイントの証明機関は？\{#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints}

Zilliz Cloudは、AWS、Google Cloud Platform（GCP）、Microsoft AzureでホストされているZilliz Cloudクラスターの証明書を発行および署名するために**Let's Encrypt**を使用しています。

さらに、Zilliz CloudはAWS上でのZilliz Cloudクラスターの証明書を発行およびローテーションするために**AWS Certificate Manager（ACM）**を使用しています。

### Zilliz Cloudクラスターの証明書有効期限は？\{#what-is-the-certificate-validity-period-for-my-zilliz-cloud-cluster}

Zilliz Cloudクラスターのために発行された証明書は、発行日から**90日間**有効であり、有効期限の**30日前**に自動的にローテーションされます。

### 証明書が期限切れかどうかを確認するには？\{#how-can-i-check-whether-a-certificate-expires}

以下のコマンドを実行して、Zilliz Cloudクラスターの証明書が期限切れかどうかを確認できます。

以下の例のコマンドは、GCPでクラスターを作成し、インスタンスIDが`inxx-xxxxxxxxxxxxxxxxx`であると想定しています。ターゲットクラスターエンドポイントが`：443`などの正しいポート番号で終わっていることを確認してください。

```bash
echo | openssl s_client -showcerts -connect inxx-xxxxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com:443 2> /dev/null | openssl x509 -noout -enddate
```

コマンドの出力は以下のようになります：

```bash
notAfter=Jul  7 06:58:17 2025 GMT
```

### Zilliz CloudでサポートされているTLSバージョンは？\{#which-tls-versions-are-supported-on-zilliz-cloud}

セキュリティ上の理由から、Zilliz Cloudは**TLS 1.2**および**TLS 1.2以上**のみをサポートしています。TLS 1.0およびTLS 1.1はサポートされていません。

### Zilliz CloudはmTLSをサポートしていますか？\{#does-zilliz-cloud-support-mtls}

Zilliz Cloudは現在、一方向TLS認証のみをサポートしており、双方向TLS認証はサポートしていません。