---
title: "FAQ: セキュリティ | CLOUD"
slug: /faq-security
sidebar_label: "FAQ: セキュリティ"
beta: FALSE
notebook: FALSE
description: "このトピックでは、認証局、証明書の有効期間、証明書の有効期限を確認する手順、サポートされている Transport Layer Security（TLS）バージョン、認証方法など、Zilliz Cloud プラットフォームにおけるデータセキュリティ関連の潜在的な問題について説明します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 14
displayed_sidebar: default

---

# FAQ: セキュリティ

このトピックでは、認証局、証明書の有効期間、証明書の有効期限を確認する手順、サポートされている Transport Layer Security（TLS）バージョン、認証方法など、Zilliz Cloud プラットフォームにおけるデータセキュリティ関連の潜在的な問題について説明します。

## 目次

- [Zilliz Cloud クラスターエンドポイントの認証局は何ですか？](#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints)
- [自分の Zilliz Cloud クラスターの証明書の有効期間はどれくらいですか？](#what-is-the-certificate-validity-period-for-my-zilliz-cloud-cluster)
- [証明書の有効期限を確認するにはどうすればよいですか？](#how-can-i-check-whether-a-certificate-expires)
- [Zilliz Cloud ではどの TLS バージョンがサポートされていますか？](#which-tls-versions-are-supported-on-zilliz-cloud)
- [Zilliz Cloud は mTLS をサポートしていますか？](#does-zilliz-cloud-support-mtls)

## FAQ




### Zilliz Cloud クラスターエンドポイントの認証局は何ですか？\{#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints}

Zilliz Cloud は、AWS、Google Cloud Platform（GCP）、および Microsoft Azure でホストされる Zilliz Cloud クラスターの証明書の発行と署名に **Let's Encrypt** を使用しています。 

さらに、Zilliz Cloud は AWS 上の Zilliz Cloud クラスターに対して、証明書の発行とローテーションに **AWS Certificate Manager (ACM)** を使用しています。

### 自分の Zilliz Cloud クラスターの証明書の有効期間はどれくらいですか？\{#what-is-the-certificate-validity-period-for-my-zilliz-cloud-cluster}

Zilliz Cloud クラスターに対して発行された証明書は、発行日から **90日間** 有効であり、有効期限の **30日前** に自動的にローテーションされます。

### 証明書の有効期限を確認するにはどうすればよいですか？\{#how-can-i-check-whether-a-certificate-expires}

以下のコマンドを実行して、Zilliz Cloud クラスターの証明書が期限切れになるかどうかを確認できます。 

以下のコマンド例では、GCP にクラスターを作成しており、そのインスタンス ID が `inxx-xxxxxxxxxxxxxxxxx` であることを前提としています。対象のクラスターエンドポイントが `:443` などの正しいポート番号で終わっていることを確認してください。

```bash
echo | openssl s_client -showcerts -connect inxx-xxxxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com:443 2> /dev/null | openssl x509 -noout -enddate
```

コマンドの出力は次のようになります。

```bash
notAfter=Jul  7 06:58:17 2025 GMT
```

### Zilliz Cloud ではどの TLS バージョンがサポートされていますか？\{#which-tls-versions-are-supported-on-zilliz-cloud}

セキュリティ上の理由により、Zilliz Cloud は **TLS 1.2** および **TLS 1.2+** のみをサポートしています。TLS 1.0 および TLS 1.1 はサポートされていません。

### Zilliz Cloud は mTLS をサポートしていますか？\{#does-zilliz-cloud-support-mtls}

Zilliz Cloud は現在、一方向 TLS 認証のみをサポートしており、双方向 TLS 認証はサポートしていません。
