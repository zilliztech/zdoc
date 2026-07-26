---
title: "Analyze Cost | BYOC"
slug: /analyze-cost
sidebar_label: "Analyze Cost"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The Usage page in Zilliz Cloud provides you with a visualized cost analysis tool, enabling you to view and track Zilliz Cloud usage and expenses from multiple dimensions. | BYOC"
type: origin
token: LJplw7Q9Gi09GMkiy8PcbYp6nrg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Analyze Cost

The **Usage** page in Zilliz Cloud provides you with a visualized cost analysis tool, enabling you to view and track Zilliz Cloud usage and expenses from multiple dimensions.

## Prerequisites\{#prerequisites}

To access and analyze costs via the Zilliz Cloud usage page, you must have **Organization Owner** or **Billing Admin** permissions.

## Procedures\{#procedures}

There are two ways to analyze costs on Zilliz Cloud. 

- [Via Web UI](./analyze-cost#via-web-ui): If you need to visualize the cost trends, we recommend using the web UI. Usage details on the web UI are rounded to **10 decimal places**.

- [Via RESTful API](./analyze-cost#via-restful-api): If you need more detailed insights into the daily usage, we recommend using the RESTful API. Usage details obtained from the RESTful API are precise to **10 decimal places**.

### Via Web UI\{#via-web-ui}

On the **Billing** page, switch to the **Usage** tab. You can monitor the usage and cost trends across various dimensions.

<Admonition type="info" icon="📘" title="📘 Notes">

Usage data is updated on an hourly basis.

</Admonition>

![analyze_cost](https://zdoc-images.s3.us-west-2.amazonaws.com/analyze_cost.png "analyze_cost")

- **By Project**

    If you have created multiple projects for different businesses or departments, you can filter and view usage and costs for a specific project.

    For example, if you have created two projects, Default Project (for the R&D department) and Project_01 (for the Marketing department), you can select Default Project in the project filter to analyze the R&D department's usage and costs over the past month.

    The Usage Amount bar chart will visually represent daily usage changes, and the Usage Amount Details table provides data in tabular form.

