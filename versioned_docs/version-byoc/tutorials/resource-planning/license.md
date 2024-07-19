---
slug: /license
beta: FALSE
notebook: FALSE
type: origin
token: YXwjweT1Mi8hLckPrjdckUHdnMd
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - license

---

import Admonition from '@theme/Admonition';


# License

The Zilliz Cloud Bring Your Own Cloud (BYOC) solution offers a subscription model enabling you to deploy Zilliz Cloud services on your cloud infrastructure for enhanced security. This topic explores the BYOC license, emphasizing its usage, monitoring, and implications for users.

## Calculation of CPU cores{#calculation-of-cpu-cores}

The calculation method for the Zilliz Cloud BYOC solution involves distinguishing between the control plane and the data plane.

- **Control Plane**:

    - Hosted on Zilliz Cloud

    - Provides API functionality, Zilliz Cloud platform operations, data backup, migration, and alerts

    - CPU cores consumed at the control plane are not deducted from the cores subscribed in the BYOC license

- **Data Plane**:

    - Deployed in your own VPC

    - Fully controlled for security

    - Includes Zilliz Cloud services

    - CPU cores consumed at the data plane are deducted from the cores subscribed in your license

The following table summarizes the calculation of CPU cores for a BYOC license.

<table>
   <tr>
     <th><p>Deployment</p></th>
     <th><p>Plane</p></th>
     <th><p>Component</p></th>
     <th><p>Billable?</p></th>
   </tr>
   <tr>
     <td><p>Zilliz Cloud</p></td>
     <td><p>Control Plane</p></td>
     <td><p>API functionality, cloud ops, backup, migration, alerts, etc.</p></td>
     <td><p>No</p></td>
   </tr>
   <tr>
     <td><p>User's VPC</p></td>
     <td><p>Data Plane</p></td>
     <td><p>Index services</p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td></td>
     <td></td>
     <td><p>Zilliz Cloud cluster services</p></td>
     <td><p>Yes</p></td>
   </tr>
</table>

## View license information{#view-license-information}

As the [Organization Owner](./resource-hierarchy), you can access and review detailed license information:

- **License ID**: A distinct code that identifies your organization's license.

- **Cloud Provider**: Your cloud service provider powering Zilliz Cloud BYOC services.

- **License Term**: Start and end dates indicating the active period of your license.

- **Usage**: Current CPU core usage as a percentage of the total cores included in your license.

For more details on resource consumption:

Click **View Details** to see CPU core usage by each service and cluster, along with the cloud region where they are deployed.

![view-license-info](/byoc/view-license-info.png)

## Monitor license usage{#monitor-license-usage}

Check out the **Usage** progress bar on the **License Information** page, which offers a visual guide showing how you're using your license. Please take the appropriate action based on the color indicators:

- **Green**: Your license usage is comfortably within limits, with core usage below 70% and over 60 days of validity remaining. Keep monitoring to ensure it stays in this range.

- **Yellow**: A nudge to start thinking about renewing or upgrading your license, with core usage between 70-99% or validity under 60 days. Time to assess your future needs and prepare for action.

- **Red**: A clear signal that immediate action is required, with core usage over 100% or license expiration. Critical to renew or upgrade now to avoid operational disruptions.

Contact our sales for help if you are in the yellow or red zone. We recommend you renew or upgrade your license before it expires or reaches its limit to avoid restrictions like the inability to create new clusters or scale up.

![monitor-license-usage](/byoc/monitor-license-usage.png)

## License expiration or overuse{#license-expiration-or-overuse}

To prevent service disruptions, renew or upgrade your license if it is approaching expiration or nearing the core usage limit. Zilliz Cloud's flexible approach to fluctuating business needs includes:

- **Core Usage Overuse**: Exceeding your core quota won't impact existing clusters, but you may be restricted from creating new clusters, scaling up, or activating new cloud regions.

- **Expiration**: A one-month grace period follows subscription expiration, allowing continued access to Zilliz Cloud services. This period is intended for subscription renewal or upgrade.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud simultaneously keeps track of your license's validity period and core usage, and applies restrictions accordingly if your license expires while cores are overused.</p>

</Admonition>

## Potential consequences of failing to renew or upgrade{#potential-consequences-of-failing-to-renew-or-upgrade}

Failing to renew or upgrade within the one-month grace period results in your Zilliz Cloud account being frozen and service access revoked. The following operations are prohibited once frozen:

- Creating, restarting, stopping, or scaling clusters

- Managing cluster users or passwords

- Setting maintenance windows

- Modifying whitelist IP addresses

- Managing collections or indexes through the web console or SDKs

## Related topics{#related-topics}

- [Activate Your Cloud](./activate-your-cloud)

- [Select the Right CU](./cu-types-explained)

- [Create Cluster](./create-cluster)

