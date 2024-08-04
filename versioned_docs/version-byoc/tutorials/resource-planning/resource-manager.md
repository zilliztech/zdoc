---
title: "Resource Manager | BYOC"
slug: /resource-manager
sidebar_label: "Resource Manager"
beta: FALSE
notebook: FALSE
description: "The Resource Manager is pivotal for monitoring your Bring Your Own Cloud (BYOC) resources. This module ensures you have complete visibility and control over the cloud resources within your infrastructure. | BYOC"
type: origin
token: HLkQwRiK2i6dFukrOB2cRdFTnR7
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - resource
  - manager

---

import Admonition from '@theme/Admonition';


# Resource Manager

The **Resource Manager** is pivotal for monitoring your Bring Your Own Cloud (BYOC) resources. This module ensures you have complete visibility and control over the cloud resources within your infrastructure.

## Monitor cloud resources{#monitor-cloud-resources}

On the **Resources** tab in the **Resource Manager**, view the list of cloud services powering your BYOC cluster, including virtual machines (e.g., **m6i.2xlarge**), storage volumes, load balancers, etc.

In the Zilliz Cloud console, each resource is sorted by cloud region. By clicking the links next to each resource, you can directly access the web console of your cloud service provider.

<Admonition type="info" icon="📘" title="Notes">

<p>All resources used for Zilliz Cloud services will be tagged with <strong>byoc</strong>, making it easy for you to quickly locate and manage them.</p>

</Admonition>

![resource_manager_1](/byoc/resource_manager_1.png)

## Oversee service components{#oversee-service-components}

On the **Service Components** tab in the **Resource Manager**, view service components deployed on your infrastructure, including the instances running each component, CPU core consumption, and sub-service components.

- **Control Components**: Crucial for cloud operations, encompassing monitoring, Kubernetes system processes, data access services, and Milvus operator components.

- **Data Service**: Manages data operations, including proxy nodes, query nodes, coordinators, and data nodes.

- **Dependent Service**: Auxiliary services like metadata services and messaging queues that support other components.

For in-depth information on each component, refer to [BYOC Components (Dev)](./byoc-components).

![resource_manager_2](/byoc/resource_manager_2.png)

## Related topics{#related-topics}

- [License](./license)

- [BYOC Components (Dev)](./byoc-components)

- [Create Cluster (Dev)](./create-cluster)

