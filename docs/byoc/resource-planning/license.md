---
displayed_sidebar: paasSidebar
slug: /docs/byoc/license
beta: FALSE
notebook: FALSE
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# License

The Zilliz Cloud Bring Your Own Cloud (BYOC) license offers a subscription model enabling you to utilize Zilliz Cloud services on your cloud infrastructure. This topic explores the BYOC license, emphasizing its usage, monitoring, and implications for users.

## License overview{#license-overview}

The BYOC license operates on a core-based subscription model, linking your subscription to the number of CPU cores dedicated to your cluster services. Key features include:

- **Validity Period**: Each license has a specific start and end date, defining the period during which Zilliz Cloud services can be used.

- **Core Allocation**: Under a BYOC license, a specific number of CPU cores are allocated for running Zilliz Cloud clusters. This core allocation directly influences the cluster's performance and scalability. 

## View license information{#view-license-information}

You can manage and view your BYOC license details in the Zilliz Cloud console.

To view license information, you must be the [Organization Owner](./a-panorama-view#organization-roles).

![view-license-info](/byoc/view-license-info.png)

## Monitor license usage{#monitor-license-usage}

Check out the **Usage** progress bar on the **License Information** page, which offers an easy-to-understand visual guide showing how you're using your license. Please take the appropriate action based on the color indicators:

- **Green**: Your license usage is comfortably within limits, with core usage below 70% and over 60 days of validity remaining. Keep monitoring to ensure it stays in this range.

- **Yellow**: A nudge to start thinking about renewing or upgrading your license, with core usage between 70-99% or validity under 60 days. Time to assess your future needs and prepare for action.

- **Red**: A clear signal that immediate action is required, with core usage over 100% or license expiration. Critical to renew or upgrade now to avoid operational disruptions.

Contact our sales for help if you are in the yellow or red zone. We recommend you renew or upgrade your license before it expires or reaches its limit to avoid restrictions like the inability to create new clusters or scale up.

![monitor-license-usage](/byoc/monitor-license-usage.png)

## License expiration or overuse{#license-expiration-or-overuse}

To prevent service disruptions, renew or upgrade your license if it is approaching expiration or nearing the core usage limit. Zilliz Cloud's flexible approach to fluctuating business needs includes:

- **Core Usage Overuse**: Exceeding your core quota won't impact existing clusters, but you may be restricted from creating new clusters, scaling up, or activating new cloud regions.

- **Expiration**: A __one-month__ grace period follows subscription expiration, allowing continued access to Zilliz Cloud services. This period is intended for subscription renewal or upgrade.

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud simultaneously keeps track of your license's validity period and core usage, and applies restrictions accordingly if your license expires while cores are overused.

</Admonition>

## Potential consequences of failing to renew or upgrade{#potential-consequences-of-failing-to-renew-or-upgrade}

Failing to renew or upgrade within the __one-month__ grace period results in your Zilliz Cloud account being frozen and service access revoked. The following operations are prohibited once frozen:

- Creating, restarting, stopping, or scaling clusters

- Managing cluster users or passwords

- Setting maintenance windows

- Modifying whitelist IP addresses

- Managing collections or indexes through the web console or SDKs

## Related topics{#related-topics}

- [Activate Your Cloud](./activate-your-cloud) 

- [Select the Right CU](./cu-types-explained)

- [Create Cluster](./create-cluster) 
