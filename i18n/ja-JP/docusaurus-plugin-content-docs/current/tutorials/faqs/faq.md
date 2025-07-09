---
title: "FAQ:セキュリティ | CLOUD"
slug: /faq
sidebar_label: "FAQ:セキュリティ"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudプラットフォーム上のデータセキュリティに関連する潜在的な問題について説明します。これには、認証局、証明書の有効期間、証明書の有効期限の確認手順、サポートされているTransport Layer Security(TLS)バージョン、および認証方法が含まれます。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 15

---

# FAQ:セキュリティ

このトピックでは、Zilliz Cloudプラットフォーム上のデータセキュリティに関連する潜在的な問題について説明します。これには、認証局、証明書の有効期間、証明書の有効期限の確認手順、サポートされているTransport Layer Security(TLS)バージョン、および認証方法が含まれます。

## Contents

- [Zilliz Cloudクラスターエンドポイントの認証局は何ですか?](#zilliz-cloud)
- [私のZilliz Cloudクラスタの証明書の有効期間は何ですか?](#zilliz-cloud)
- [証明書の有効期限を確認するにはどうすればよいですか?](#)
- [Zilliz CloudでサポートされているTLSバージョンは何ですか?](#zilliz-cloudtls)
- [Zilliz CloudはmTLSをサポートしていますか?](#zilliz-cloudmtls)

## FAQs




### Zilliz Cloudクラスターエンドポイントの認証局は何ですか?{#zilliz-cloud}

Zilliz Cloudは、AWS、Google Cloud Platform（GCP）、およびMicrosoft AzureにホストされたZilliz Cloudクラスターの証明書を発行および署名するために**Let's Encrypt**を使用しています。 

さらに、Zilliz CloudはAWS上のZilliz Cloudクラスターの証明書を発行およびローテーションするために、AWS Certificate Manager（ACM）を使用しています。

### 私のZilliz Cloudクラスタの証明書の有効期間は何ですか?{#zilliz-cloud}

いずれかのZilliz Cloudクラスターに発行された証明書は、発行日から90日間有効であり、有効期限の30日前に自動的にローテーションされます。

### 証明書の有効期限を確認するにはどうすればよいですか?{#}

次のコマンドを実行して、Zilliz Cloudクラスターの証明書の有効期限が切れているかどうかを確認できます。 

以下の例のコマンドは、GCPでクラスタを作成し、そのインスタンスIDが`inxx-xxxxxxxxxxxxxxxxx`であることを前提としています。ターゲットクラスタのエンドポイントが`:443`などの正しいポート番号で終わるようにしてください。

```bash
echo | openssl s_client -showcerts -connect inxx-xxxxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com:443 2> /dev/null | openssl x509 -noout -enddate
```

コマンドの出力は次のようになります:

```bash
notAfter=Jul  7 06:58:17 2025 GMT
```

### Zilliz CloudでサポートされているTLSバージョンは何ですか?{#zilliz-cloudtls}

セキュリティ上の理由から、Zilliz CloudはTLS 1.2とTLS 1.2+のみをサポートしています。TLS 1.0とTLS 1.1はサポートされていません。

### Zilliz CloudはmTLSをサポートしていますか?{#zilliz-cloudmtls}

Zilliz Cloudは現在、片方向のTLS認証のみをサポートしており、双方向のTLS認証はサポートしていません。