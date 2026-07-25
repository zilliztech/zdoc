---
title: "环境需求 | On-Premise"
slug: /requirements
sidebar_label: "环境需求"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "为确保 Milvus 的运行环境稳定，在安装部署前需要按照确认运行环境满足如下软硬件要求。 | On-Premise"
type: origin
token: JexBwOSVxiYpa3k5ww4cmbw3nOb
sidebar_position: 1
keywords: 
  - 向量数据库
  - 私有部署
  - milvus
  - 大模型向量数据库
  - 部署运维手册
  - 环境要求
displayed_sidebar: onPremiseSidebar

---

<head>
  <meta name="robots" content="noindex" />
</head>


import Admonition from '@theme/Admonition';


# 环境需求

为确保 Milvus 的运行环境稳定，在安装部署前需要按照确认运行环境满足如下软硬件要求。

## 软件版本要求\{#software-requirements}

<table>
   <tr>
     <th><p><strong>软件名称</strong></p></th>
     <th><p><strong>版本要求</strong></p></th>
     <th><p><strong>说明</strong></p></th>
   </tr>
   <tr>
     <td><p>Milvus</p></td>
     <td><p>v2.4.9+</p></td>
     <td><p>由 Zilliz 提供企业版镜像。</p></td>
   </tr>
   <tr>
     <td><p>kubernetes</p></td>
     <td><p>v1.24+</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>kubernetes Node</p></td>
     <td><p>Ubuntu 22.04+ 或其他发行版，linux内核版本5.8+</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Milvus Operator</p></td>
     <td><p>v1.0.5+</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Helm</p></td>
     <td><p>v3.10.0+</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>etcd</p></td>
     <td><p>v3.5.13-r1+</p></td>
     <td><p>由用户选择自行安装或基于 Milvus Operator 模式部署。</p></td>
   </tr>
   <tr>
     <td><p>pulsar</p></td>
     <td><p>v2.9.5+</p></td>
     <td><p>由用户选择自行安装或基于 Milvus Operator 模式部署。</p></td>
   </tr>
   <tr>
     <td><p>minio</p></td>
     <td><p>RELEASE.2023-03-20T20-16-18Z +</p></td>
     <td><p>或兼容 S3 协议的对象存储服务。</p></td>
   </tr>
   <tr>
     <td><p>StorgeClass</p></td>
     <td><p>无</p></td>
     <td><p>若基于 Milvus Opeartor 安装 etcd/Pulsar，则要求 Kubernetes 集群的 StorageClass 能够创建访问方式为 ReadWriteOnce 的 PersistentVolume (PV)。</p><p>建议开启 allowVolumeExpansion。</p></td>
   </tr>
   <tr>
     <td><p>LoadBalancer</p></td>
     <td><p>无</p></td>
     <td><p>若 Milvus 实例需要提供 Kubernetes 集群外访问，建议以 LoadBalancer 模式提供服务</p></td>
   </tr>
</table>

## 硬件资源要求\{#hardware-requirements}

<table>
   <tr>
     <th><p><strong>硬件名称</strong></p></th>
     <th><p><strong>要求</strong></p></th>
     <th><p><strong>说明</strong></p></th>
   </tr>
   <tr>
     <td><p>CPU</p></td>
     <td><p>使用x86 Cascade Lake 及以上型号，建议使用 Ice Lake 以上型号。</p></td>
     <td><p>可以通过在机器上执行命令：<code>gcc -march=native -Q --help=target|grep march</code> 查询。</p></td>
   </tr>
   <tr>
     <td><p>Milvus Node 节点资源</p></td>
     <td><p>根据数据量计算所需CPU/Memory 资源需求</p></td>
     <td><p>可使用 <a href="https://milvus.io/tools/sizing">Milvus Sizing Tool</a> 预估所需要资源。</p></td>
   </tr>
   <tr>
     <td><p>Milvus Node 节点磁盘</p></td>
     <td><p>NVMe SSD 盘</p></td>
     <td><p>建议挂载到kubelet使用的目录。</p><p>echo "KUBELET_EXTRA_ARGS=--root-dir=/data1/kubelet" &gt; /etc/sysconfig/kubelet</p><p>systemctl restart kubelet</p></td>
   </tr>
   <tr>
     <td><p>Milvus Operator 资源</p></td>
     <td><p>2 vCPU 8 GiB 及以上配置</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>etcd/Pulsar 磁盘</p></td>
     <td><p>NVMe SSD 盘</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

