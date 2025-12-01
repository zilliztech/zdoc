---
title: "FAQ: セキュリティ | BYOC"
slug: /faq-security
sidebar_label: "FAQ: セキュリティ"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudプラットフォーム上のデータセキュリティに関する潜在的な問題について、証明機関、証明書有効期間、証明書の有効期限チェック手順、サポートされるトランスポート層セキュリティ（TLS）バージョン、認証方法を含めてこのトピックで説明します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 12

---

# FAQ: セキュリティ

このトピックでは、証明機関、証明書有効期間、証明書の有効期限チェック手順、サポートされるトランスポート層セキュリティ（TLS）バージョン、認証方法を含む、Zilliz Cloudプラットフォーム上のデータセキュリティに関する潜在的な問題について説明します。

## 目次

- [Zilliz Cloudクラスターエンドポイントの証明機関は何ですか？](#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints)
- [Zilliz Cloudクラスターの証明書有効期間はどのくらいですか？](#what-is-the-certificate-validity-period-for-my-zilliz-cloud-cluster)
- [証明書の有効期限をどのように確認できますか？](#how-can-i-check-whether-a-certificate-expires)
- [Zilliz CloudでサポートされるTLSバージョンはどれですか？](#which-tls-versions-are-supported-on-zilliz-cloud)
- [Zilliz CloudはmTLSをサポートしていますか？](#does-zilliz-cloud-support-mtls)

## よくある質問




### Zilliz Cloudクラスターエンドポイントの証明機関は何ですか？\{#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints}

Zilliz Cloudは、AWS、Google Cloud Platform（GCP）、Microsoft AzureでホストされているZilliz Cloudクラスターの証明書を発行および署名するために**Let's Encrypt**を使用します。

さらに、Zilliz Cloudは、AWS上のZilliz Cloudクラスターの証明書を発行およびローテーションするために**AWS Certificate Manager（ACM）**を採用しています。

### Zilliz Cloudクラスターの証明書有効期間はどのくらいですか？\{#what-is-the-certificate-validity-period-for-my-zilliz-cloud-cluster}

Zilliz Cloudクラスター用に発行された証明書は、発行日から**90日間**有効であり、有効期限の**30日前**に自動的にローテーションされます。

### 証明書の有効期限をどのように確認できますか？\{#how-can-i-check-whether-a-certificate-expires}

以下のコマンドを実行して、Zilliz Cloudクラスターの証明書の有効期限を確認できます。

以下の例では、GCPにクラスターを作成し、インスタンスIDが`inxx-xxxxxxxxxxxxxxxxx`であると仮定しています。ターゲットクラスターエンドポイントが`:443`のような正しいポート番号で終わることを確認してください。

```bash
echo | openssl s_client -showcerts -connect inxx-xxxxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com:443 2> /dev/null | openssl x509 -noout -enddate
```

コマンドの出力は以下のようになります：

```bash
notAfter=Jul  7 06:58:17 2025 GMT
```

### Zilliz CloudでサポートされるTLSバージョンはどれですか？\{#which-tls-versions-are-supported-on-zilliz-cloud}

セキュリティ上の理由から、Zilliz Cloudは**TLS 1.2**および**TLS 1.2+**のみをサポートしています。TLS 1.0およびTLS 1.1はサポートされていません。

### Zilliz CloudはmTLSをサポートしていますか？\{#does-zilliz-cloud-support-mtls}

Zilliz Cloudは現在、片方向TLS認証のみをサポートしており、双方向TLS認証はサポートしていません。
