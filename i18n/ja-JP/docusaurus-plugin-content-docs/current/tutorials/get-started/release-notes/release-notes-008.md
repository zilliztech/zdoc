---
title: "リリースノート (2022年11月18日) | Cloud"
slug: /release-notes-008
sidebar_label: "リリースノート (2022年11月18日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudの主要アップデートの一般提供を発表できることを嬉しく思います。このアップデートは招待なしで一般に公開されました。このリリースでは、容量最適化コンピュートユニット (CU) を導入し、パフォーマンスを向上させるためにデータベースごとに最大32個のCUを許可しています。また、ローカルファイルおよびAWS S3バケットからのデータインポートを可能にし、オートインデックス作成でプロセスを簡素化し、QPSおよびクエリレイテンシのリソースモニタリングを追加しています。さらに、データベース作成速度は5倍高速化され、ユーザーエクスペリエンス向上のためにユーザーインターフェースが最適化されています。 | Cloud"
type: origin
token: Q9ZcwPZieiYoU4kwEuOcFjewneP
sidebar_position: 30
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector

---

import Admonition from '@theme/Admonition';


# リリースノート (2022年11月18日)

招待なしで一般に公開されたZilliz Cloudの主要アップデートの一般提供を発表できることを嬉しく思います。このリリースでは、容量最適化コンピュートユニット (CU) を導入し、パフォーマンスを向上させるためにデータベースごとに最大32個のCUを許可しています。また、ローカルファイルおよびAWS S3バケットからのデータインポートを可能にし、オートインデックス作成でプロセスを簡素化し、QPSおよびクエリレイテンシのリソースモニタリングを追加しています。さらに、データベース作成速度は5倍高速化され、優れたユーザーエクスペリエンスのためにユーザーインターフェースが最適化されています。

- 一般に公開され、Zilliz Cloudへの登録に招待は不要になりました。

- 容量最適化CUをサポート。

- データベースに最大32個のCUを割り当てることをサポート。

- ローカルファイルおよびAWS S3バケットからのデータインポートをサポート。

- [オートインデックス作成](./autoindex-explained) をサポートし、インデックスタイプを選択する必要がなくなりました。

- QPSおよびクエリレイテンシの[リソースモニター](./metrics-and-alerts)の設定をサポート。

- データベース作成のパフォーマンスを5倍向上。

- より良いユーザーエクスペリエンスのためにUIパフォーマンスを最適化。