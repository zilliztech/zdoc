---
title: "FAQ: セキュリティ | CLOUD"
slug: /faq-security
sidebar_label: "FAQ: セキュリティ"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud プラットフォームのデータセキュリティに関連する可能性のある問題について説明します。これには、認証局、証明書の有効期間、証明書の有効期限を確認する手順、サポートされる Transport Layer Security (TLS) バージョン、認証方式が含まれます。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 14

---

# FAQ: セキュリティ

このトピックでは、Zilliz Cloud プラットフォームのデータセキュリティに関連する可能性のある問題について説明します。これには、認証局、証明書の有効期間、証明書の有効期限を確認する手順、サポートされる Transport Layer Security (TLS) バージョン、認証方式が含まれます。

## 目次

- [Zilliz Cloud クラスターエンドポイントの認証局は何ですか？](#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints)
- [Zilliz Cloud クラスターの証明書の有効期間はどれくらいですか？](#what-is-the-certificate-validity-period-for-my-zilliz-cloud-cluster)
- [証明書が期限切れになるかどうかを確認するにはどうすればよいですか？](#how-can-i-check-whether-a-certificate-expires)
- [Zilliz Cloud でサポートされる TLS バージョンはどれですか？](#which-tls-versions-are-supported-on-zilliz-cloud)
- [Zilliz Cloud は mTLS をサポートしていますか？](#does-zilliz-cloud-support-mtls)

## よくある質問




### Zilliz Cloud クラスターエンドポイントの認証局は何ですか？\{#what-is-the-certificate-authority-for-zilliz-cloud-cluster-endpoints}

Zilliz Cloud は **Let's Encrypt** を使用して、AWS、Google Cloud Platform (GCP)、Microsoft Azure 上でホストされる Zilliz Cloud クラスターの証明書を発行および署名します。

さらに、Zilliz Cloud は **AWS Certificate Manager (ACM)** を使用して、AWS 上の Zilliz Cloud クラスターの証明書を発行およびローテーションします。

### Zilliz Cloud クラスターの証明書の有効期間はどれくらいですか？\{#what-is-the-certificate-validity-period-for-my-zilliz-cloud-cluster}

Zilliz Cloud クラスターに発行される証明書は、発行日から **90 日間** 有効で、有効期限の **30 日前** に自動的にローテーションされます。

### 証明書が期限切れになるかどうかを確認するにはどうすればよいですか？\{#how-can-i-check-whether-a-certificate-expires}

次のコマンドを実行して、Zilliz Cloud クラスターの証明書が期限切れになるかどうかを確認できます。

次のコマンド例では、GCP にクラスターを作成済みで、そのインスタンス ID が `inxx-xxxxxxxxxxxxxxxxx` であると仮定しています。ターゲットクラスターエンドポイントが `:443` などの正しいポート番号で終わっていることを確認してください。

```bash
echo | openssl s_client -showcerts -connect inxx-xxxxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com:443 2> /dev/null | openssl x509 -noout -enddate
```

コマンド出力は次のようになります。

```bash
notAfter=Jul  7 06:58:17 2025 GMT
```

### Zilliz Cloud でサポートされる TLS バージョンはどれですか？\{#which-tls-versions-are-supported-on-zilliz-cloud}

セキュリティ上の理由から、Zilliz Cloud は **TLS 1.2** および **TLS 1.2+** のみをサポートしています。TLS 1.0 と TLS 1.1 はサポートされていません。

### Zilliz Cloud は mTLS をサポートしていますか？\{#does-zilliz-cloud-support-mtls}

Zilliz Cloud は現在、一方向 TLS 認証のみをサポートしており、双方向 TLS 認証はサポートしていません。
