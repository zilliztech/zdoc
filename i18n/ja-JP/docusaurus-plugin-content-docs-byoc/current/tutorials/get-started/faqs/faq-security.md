---
title: "FAQ: セキュリティ | BYOC"
slug: /faq-security
sidebar_label: "FAQ: セキュリティ"
beta: FALSE
notebook: FALSE
description: "このトピックでは、認証局、証明書の有効期間、証明書の有効期限を確認する手順、サポートされている Transport Layer Security (TLS) のバージョン、認証方法など、Zilliz Cloud プラットフォームにおけるデータセキュリティに関する潜在的な問題を取り上げます。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 12
displayed_sidebar: default

---

# FAQ: セキュリティ

このトピックでは、認証局、証明書の有効期間、証明書の有効期限を確認する手順、サポートされている Transport Layer Security (TLS) のバージョン、認証方法など、Zilliz Cloud プラットフォームにおけるデータセキュリティに関する潜在的な問題を取り上げます。

## 目次

- [Zilliz Cloud クラスターエンドポイントの認証局は何ですか？](#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints)
- [自分の Zilliz Cloud クラスターの証明書の有効期間はどれくらいですか？](#what-is-the-certificate-validity-period-for-my-zilliz-cloud-cluster)
- [証明書の有効期限が切れるかどうかはどのように確認できますか？](#how-can-i-check-whether-a-certificate-expires)
- [Zilliz Cloud ではどの TLS バージョンがサポートされていますか？](#which-tls-versions-are-supported-on-zilliz-cloud)
- [Zilliz Cloud は mTLS をサポートしていますか？](#does-zilliz-cloud-support-mtls)

## FAQs




### Zilliz Cloud クラスターエンドポイントの認証局は何ですか？\{#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints}

Zilliz Cloud は、AWS、Google Cloud Platform (GCP)、および Microsoft Azure でホストされる Zilliz Cloud クラスターの証明書の発行と署名に **Let's Encrypt** を使用しています。 

さらに、Zilliz Cloud は AWS 上の Zilliz Cloud クラスター向けの証明書を発行およびローテーションするために **AWS Certificate Manager (ACM)** を使用しています。

### 自分の Zilliz Cloud クラスターの証明書の有効期間はどれくらいですか？\{#what-is-the-certificate-validity-period-for-my-zilliz-cloud-cluster}

お使いのいずれの Zilliz Cloud クラスターに対して発行された証明書も、発行日から **90 日間** 有効であり、有効期限の **30 日前** に自動的にローテーションされます。

### 証明書の有効期限が切れるかどうかはどのように確認できますか？\{#how-can-i-check-whether-a-certificate-expires}

以下のコマンドを実行すると、Zilliz Cloud クラスターの証明書の有効期限が切れるかどうかを確認できます。 

次のコマンド例は、GCP にクラスターを作成済みで、そのインスタンス ID が `inxx-xxxxxxxxxxxxxxxxx` であることを前提としています。対象のクラスターエンドポイントが `:443` のように正しいポート番号で終わっていることを確認してください。

```bash
echo | openssl s_client -showcerts -connect inxx-xxxxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com:443 2> /dev/null | openssl x509 -noout -enddate
```

コマンド出力は次のようになります。

```bash
notAfter=Jul  7 06:58:17 2025 GMT
```

### Zilliz Cloud ではどの TLS バージョンがサポートされていますか？\{#which-tls-versions-are-supported-on-zilliz-cloud}

セキュリティ上の理由により、Zilliz Cloud は **TLS 1.2** および **TLS 1.2+** のみをサポートしています。TLS 1.0 および TLS 1.1 はサポートされていません。

### Zilliz Cloud は mTLS をサポートしていますか？\{#does-zilliz-cloud-support-mtls}

Zilliz Cloud は現在、一方向 TLS 認証のみをサポートしており、双方向 TLS 認証はサポートしていません。
