---
slug: /select-zilliz-cloud-service-plans
sidebar_label: Cluster Plans
beta: FALSE
notebook: FALSE
type: origin
token: Ghq9wEiOOivgeIkmj2HcHC9onXe
sidebar_position: 3

---

import Admonition from '@theme/Admonition';


# Select the Right Cluster Plan

Zilliz Cloud provides a range of cluster plans to suit diverse requirements. Whether you're new to vector databases or require robust solutions for enterprise-level tasks, making the right choice ensures optimal performance, scalability, and cost-efficiency. This guide will help you make an informed decision. 

## Select a cluster plan{#select-a-cluster-plan}

Zilliz Cloud categorizes its offerings into five distinct plans: **Free**, **Serverless**, **Dedicated-Standard**, **Dedicated-Enterprise**, and **Bring Your Own Cloud (BYOC)**.

<table>
   <tr>
     <th><p>Feature</p></th>
     <th><p>Starter<br/></p></th>
     <th><p>Serverless<br/></p></th>
     <th><p>Dedicated-Standard<br/></p></th>
     <th><p>Dedicated-Enterprise<br/></p></th>
     <th><p>Bring Your Own Cloud (BYOC)<br/></p></th>
   </tr>
   <tr>
     <td><p>Plan Description</p></td>
     <td><p>For learning, experimenting, and prototyping; easy migration to different plans for production.</p></td>
     <td><p>Designed for serverless applications with variable or infrequent traffic. Minimal configuration required.</p></td>
     <td><p>Suitable for applications in dev with customizable workload management. Advanced configuration options.</p></td>
     <td><p>Ideal for production applications with customizable workload management. Provides more security controls, monitors and support SLAs.</p></td>
     <td><p>For production applications with strict data security or compliance requirements. Most advanced configuration controls.</p></td>
   </tr>
   <tr>
     <td><p><strong>Pricing</strong></p></td>
     <td><p>Free</p></td>
     <td><p><a href="https://zilliz.com/pricing">View Pricing</a></p></td>
     <td><p><a href="https://zilliz.com/pricing">View Pricing</a><br/></p></td>
     <td><p><a href="https://zilliz.com/pricing">View Pricing</a></p></td>
     <td><p><a href="https://zilliz.com/contact-sales">Contact Sales</a></p></td>
   </tr>
   <tr>
     <td><p><strong>Cloud Provider & Region</strong></p></td>
     <td><p>GCP Exclusive</p></td>
     <td><p>GCP Exclusive</p></td>
     <td><p>AWS, GCP, Azure</p></td>
     <td><p>AWS, GCP, Azure</p></td>
     <td><p>User's VPC</p></td>
   </tr>
   <tr>
     <td><p><strong>CU Size Options</strong><br/></p></td>
     <td><p>Single CU<br/></p></td>
     <td><p>Auto-scale</p></td>
     <td><ul>
<li>Up to 32 CUs. (You can directly create cluster of 32 CUs or less on the web UI. For larger CU sizes, please <a href="https://zilliz.com/contact-sales">contact sales</a>.<br/> - Increments: 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32.<br/></li>
</ul></td>
     <td><ul>
<li>Up to 256 CUs.(You can directly create cluster of 256 CUs or less on the web UI. For larger CU sizes, please <a href="https://zilliz.com/contact-sales">contact sales</a>.<br/> - Increments: 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32,…,64, 72, 80, 88,…,256 <em>(Notes: When CU size is greater than 8, the increment increase becomes 4 CUs. When CU size is greater than 64, the increment increase becomes 8CUs)</em><br/></li>
</ul></td>
     <td><p>Customizable<br/></p></td>
   </tr>
   <tr>
     <td><p><strong>CU Type Options</strong><br/></p></td>
     <td><p>N/A</p></td>
     <td><p>N/A<br/></p></td>
     <td><p>2 Options:<br/> - Performance-optimized CU, or<br/> - Capacity-optimized CU<br/></p></td>
     <td><p>2 Options:<br/> - Performance-optimized CU, or<br/> - Capacity-optimized CU<br/></p></td>
     <td><p>2 Options<br/> - Performance-optimized CU, or<br/> - Capacity-optimized CU<br/></p></td>
   </tr>
   <tr>
     <td><p><strong>Max. Clusters</strong></p></td>
     <td><p>1 Cluster</p></td>
     <td><p>Customizable</p></td>
     <td><p>Customizable</p></td>
     <td><p>Customizable</p></td>
     <td><p>Customizable</p></td>
   </tr>
   <tr>
     <td><p><strong>Max. Collections</strong></p></td>
     <td><p>2 Collections, each maxing at 0.5 million 768-dimensional vectors.</p></td>
     <td><p>10 Collections per cluster.</p></td>
     <td><p>Customizable</p></td>
     <td><p>Customizable<br/></p></td>
     <td><p>Customizable</p></td>
   </tr>
   <tr>
     <td><p><strong>Private Link</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>Cloud Backup</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>Migration</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
</table>

## Related topics{#related-topics}

- [Select the Right CU](./cu-types-explained)

- [Pricing Calculator](./pricing-calculator)

- [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card)

- [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace)

- [Register with Zilliz Cloud](./register-with-zilliz-cloud)

