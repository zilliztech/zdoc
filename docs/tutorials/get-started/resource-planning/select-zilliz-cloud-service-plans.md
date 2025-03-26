---
title: "Detailed Plan Comparison | Cloud"
slug: /select-zilliz-cloud-service-plans
sidebar_label: "Plan Comparison"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud provides a range of cluster plans to suit diverse requirements. Whether you're new to vector databases or require robust solutions for enterprise-level tasks, making the right choice ensures optimal performance, scalability, and cost-efficiency. This guide will help you make an informed decision. | Cloud"
type: origin
token: Ghq9wEiOOivgeIkmj2HcHC9onXe
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster plan
  - rag llm architecture
  - private llms
  - nn search
  - llm eval

---

import Admonition from '@theme/Admonition';


# Detailed Plan Comparison

Zilliz Cloud provides a range of cluster plans to suit diverse requirements. Whether you're new to vector databases or require robust solutions for enterprise-level tasks, making the right choice ensures optimal performance, scalability, and cost-efficiency. This guide will help you make an informed decision. 

## Plan overview{#plan-overview}

Zilliz Cloud categorizes its offerings into five distinct plans.

- **Free:** The Free plan is perfect for individuals or small teams who are just getting started with Zilliz Cloud or want to experiment with its capabilities. It offers 5 GB of storage, 2.5 million vCUs per month, and support for up to 5 collections, making it ideal for small-scale projects, prototyping, or learning purposes. Choose this plan if you’re exploring Zilliz Cloud for the first time and don’t yet need advanced features or large-scale resources.

- **Serverless:** The Serverless plan is designed for users who need flexibility and scalability without the hassle of managing infrastructure. It’s a great choice for businesses with fluctuating workloads or those who want to pay only for what they use. Opt for this plan if you need to store massive data at a low cost and do not prefer committing to fixed resources.

- **Dedicated (Standard):** The Dedicated (Standard) plan is tailored for businesses with consistent, high-performance needs. It provides dedicated resources, ensuring reliable performance. Choose this plan if your project demands higher storage, compute power, and advanced features like backup and restore.

- **Dedicated (Enterprise):** The Dedicated (Enterprise) plan is designed for large enterprises. It offers enhanced security, priority support, and custom configurations to meet the most demanding requirements. Select this plan if you have strict security requirements and need features like private networking, fine-grained RBAC, and HIPPA compliance.

- **Bring Your Own Cloud (BYOC):** The BYOC Plan is ideal for enterprises that require full control over their data and infrastructure while leveraging Zilliz Cloud's advanced vector database capabilities. This plan is perfect for organizations with strict data security and compliance needs, such as those in healthcare, finance, or government, as it allows deployment within your own private cloud environment. Choose the BYOC plan if you need seamless integration with your existing cloud infrastructure, scalability for large-scale AI applications, and the ability to maintain complete data sovereignty.

## Plan comparison{#plan-comparison}

The following table compares the plans, detailing the specific features available in each plan.

<table>
   <tr>
     <th><p><strong>Feature</strong></p></th>
     <th><p>Free</p></th>
     <th><p>Serverless</p></th>
     <th><p>Dedicated (Standard)</p></th>
     <th><p>Dedicated (Enterprise)</p></th>
     <th><p>Bring Your Own Cloud (BYOC)</p></th>
   </tr>
   <tr>
     <td><p><strong>Plan description</strong></p></td>
     <td><p>A starting point for learning, experimenting, and prototyping, with easy migration to paid plans.</p></td>
     <td><p>For applications with variable or infrequent traffic. Minimal configuration required.</p></td>
     <td><p>Offers high control and consistent performance, cost-efficient for development and testing environments.</p></td>
     <td><p>Enterprise-grade features and custom configurations for mission-critical workloads. Tailored for production environments.</p></td>
     <td><p>Designed for organizations prioritizing custom infrastructure,  enhanced data protection, and compliance.</p></td>
   </tr>
   <tr>
     <td><p><strong>Pricing</strong></p></td>
     <td><p>Free</p></td>
     <td><p><a href="https://zilliz.com/pricing">View Pricing</a></p></td>
     <td><p><a href="https://zilliz.com/pricing">View Pricing</a></p></td>
     <td><p><a href="https://zilliz.com/pricing">View Pricing</a></p></td>
     <td><p><a href="https://zilliz.com/contact-sales">Contact Sales</a></p></td>
   </tr>
   <tr>
     <td><p><strong>Cloud provider & region</strong></p></td>
     <td><p>GCP Exclusive</p></td>
     <td><p>GCP Exclusive</p></td>
     <td><p>AWS, GCP, Azure For details, refer to <a href="./cloud-providers-and-regions">Cloud Providers & Regions</a>.</p></td>
     <td><p>AWS, GCP, Azure For details, refer to <a href="./cloud-providers-and-regions">Cloud Providers & Regions</a>.</p></td>
     <td><p>User's VPC</p></td>
   </tr>
   <tr>
     <td><p><strong>CU size options</strong></p></td>
     <td><p>Single CU</p></td>
     <td><p>Auto-scale</p></td>
     <td><ul><li>Up to 32 CUs. (You can directly create cluster of 32 CUs or less on the web UI. For larger CU sizes, please <a href="https://zilliz.com/contact-sales">contact sales</a>.</li><li>Increments: 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32.</li></ul></td>
     <td><ul><li>Up to 256 CUs.(You can directly create cluster of 256 CUs or less on the web UI. For larger CU sizes, please <a href="https://zilliz.com/contact-sales">contact sales</a>.</li><li>Increments: 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32,…,64, 72, 80, 88,…,256 <em>(Notes: When CU size is greater than 8, the increment increase becomes 4 CUs. When CU size is greater than 64, the increment increase becomes 8CUs)</em></li></ul></td>
     <td><p>Customizable</p></td>
   </tr>
   <tr>
     <td><p><strong>CU type options</strong></p></td>
     <td><p>N/A</p></td>
     <td><p>N/A</p></td>
     <td><p>3 Options:</p><ul><li><p>Performance-optimized CU, or</p></li><li><p>Capacity-optimized CU</p></li><li><p>Extended-capacity CU</p></li></ul></td>
     <td><p>3 Options:</p><ul><li><p>Performance-optimized CU, or</p></li><li><p>Capacity-optimized CU</p></li><li><p>Extended-capacity CU</p></li></ul></td>
     <td><p>2 Options</p><ul><li><p>Performance-optimized CU, or</p></li><li><p>Capacity-optimized CU</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>Max. projects</strong></p></td>
     <td><p>1 Project</p></td>
     <td><p>Customizable</p></td>
     <td><p>Customizable</p></td>
     <td><p>Customizable</p></td>
     <td><p>Customizable</p></td>
   </tr>
   <tr>
     <td><p><strong>Max. clusters</strong></p></td>
     <td><p>1 Cluster</p></td>
     <td><p>Customizable</p></td>
     <td><p>Customizable</p></td>
     <td><p>Customizable</p></td>
     <td><p>Customizable</p></td>
   </tr>
   <tr>
     <td><p><strong>Max. collections</strong></p></td>
     <td><p>5 Collections</p></td>
     <td><p>10 Collections per cluster.</p></td>
     <td><p>64 per CU, and \&lt;= 4096</p></td>
     <td><p>64 per CU, and \&lt;= 4096</p></td>
     <td><p>Customizable</p></td>
   </tr>
   <tr>
     <td><p><strong>Uptime SLA</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>99.95%</p></td>
     <td><p>99.95%</p></td>
   </tr>
   <tr>
     <td><p><strong>Technical support</strong></p></td>
     <td><p>Community Support</p></td>
     <td><p>Email support with response time SLAs:</p><ul><li><p>Urgent: 4 hours</p></li><li><p>High: 1 business day</p></li><li><p>Medium: 2 business days</p></li></ul></td>
     <td><p>Email support with response time SLAs:</p><ul><li><p>Urgent: 4 hours</p></li><li><p>High: 1 business day</p></li><li><p>Medium: 2 business days</p></li></ul></td>
     <td><p>Email support with response time SLAs:</p><ul><li><p>Urgent: 1 hour</p></li><li><p>High: 4 hours</p></li><li><p>Medium: 1 business day</p></li></ul></td>
     <td><p>Email support with response time SLAs:</p><ul><li><p>Urgent: 1 hour</p></li><li><p>High: 4 hours</p></li><li><p>Medium: 1 business day</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>Backup and restore</strong></p></td>
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
   <tr>
     <td><p><strong>High speed data import</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>OAuth 2.0</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>Single sign-on (SSO)</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Available (In public preview)</p></td>
     <td><p>Available (In public preview)</p></td>
   </tr>
   <tr>
     <td><p><strong>Multi-factor authentication (MFA)</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>Auditing</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>API key management</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>Data encryption in transit and at rest</strong></p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>IP address access control</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>Private link</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>SOC 2 Type II and ISO/ICE 27001 compliant, GDPR and HIPPA ready</strong></p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>Basic metrics with monitoring dashboards</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>Alerts</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>Organization and project RBAC</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>Data plane RBAC</strong></p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Not Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>Recycle bin</strong></p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
   <tr>
     <td><p><strong>Pipelines</strong></p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
     <td><p>Available</p></td>
   </tr>
</table>

## Related topics{#related-topics}

- [Select the Right CU](./cu-types-explained)

- [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card)

- [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace)

- [Register with Zilliz Cloud](./register-with-zilliz-cloud)

