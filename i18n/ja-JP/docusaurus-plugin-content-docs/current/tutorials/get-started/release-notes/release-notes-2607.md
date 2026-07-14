---
title: "2026年7月 リリースノート | Cloud"
slug: /release-notes-2607
sidebar_label: "2026年7月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: CUuywySLVil4MKkmYZecUl9snLg
sidebar_position: 2
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2026年7月 リリースノート

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-07-06**

    </div>

    <div>

        ## GCP で BYOC-I が利用可能に\{#byoc-i-now-available-on-gcp}

        Zilliz Cloud の **Bring Your Own Cloud Infrastructure (BYOC-I)** が **Google Cloud Platform (GCP)** をサポートするようになりました。

        - **セキュリティの強化:** BYOC-I により、Kubernetes API をパブリックインターネットに公開する必要がなくなります。

        - **高度な柔軟性:** BYOC-I により、公式の Terraform Provider を介して、より広範なカスタムネットワーク設定が可能になります。これで、エンタープライズ要件に合わせて調整できます。

        詳細については、手順ごとのマニュアルガイドは [Deploy BYOC-I on GCP](/docs/byoc/deploy-byoc-i-gcp)、IaC 自動化については [Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) を参照してください。

        ## 機能強化\{#enhancements}

        - **On-Demand Clusters の利用可能リージョンを拡大** — On-Demand Clusters が、Serving Dedicated のサポート対象リージョンに合わせて、すべての AWS リージョンで利用可能になりました。

    </div>

</Grid>

