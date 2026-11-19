# 并行文档生产与受控提交设计

## 目标

在保持 guides、SDK 和 REST 生成/翻译并行度的前提下，解决两类共享资源竞争：

1. SaaS 与 BYOC guides render 重复请求飞书图片和 Figma，触发 Figma 429。
2. 多个 checkpoint publisher 同时向 `dev` 推送，长时间完整构建扩大 non-fast-forward 竞争窗口。

## 总体架构

```text
Guides source fetch
  -> media prefetch (单次、受控并发的外部媒体访问)
  -> enriched source artifact
      -> SaaS render (并行，只读 media manifest)
      -> BYOC render (并行，只读 media manifest)

SDK/REST producers and translators (并行，执行完整构建)
  -> validated checkpoint artifacts
  -> short publication queue (按顺序 fetch/apply/scoped validate/commit/push)
  -> final immutable dev verification (完整构建)
```

## Guides Media Prefetch

### 输入

- `plugins/lark-docs/meta/sources/guides/*.json`
- 飞书、Figma、S3 凭证
- 可选的上一版 media manifest，用于复用未变化记录

### 媒体身份

- 飞书图片：`feishu-image:<image_token>`
- 飞书画板：`feishu-board:<board_token>`
- Figma：`figma:<file_key>:<node_id>`

### 输出

Manifest 位于 plugins/lark-docs/meta/media-cache/guides.json，记录媒体身份、caption 和 S3 object key。图片二进制始终保存在 S3，不放入 GitHub Artifact；render 使用 IMAGE_BED_URL 与 objectKey 形成访问地址。

### 上传与并发

- prefetch 复用 larkImageDownloader.__uploadToS3() 的 MD5 metadata 比对：S3 中 hash 相同则跳过上传，hash 不同或 object 不存在才上传。
- prefetch 使用有限 worker pool 并行处理媒体，默认并发 4。飞书下载和 S3 检查保持并行；Figma API 使用独立 limiter，单并发且请求启动间隔至少 1000ms，Figma CDN 图片下载不占用 API limiter。
- GitHub Artifact 的体积只与 manifest 条目数相关，不与图片大小相关。

### 增量与单篇文档

- 全量 plan 扫描全部 guides source JSON。
- 增量 plan 只扫描 expanded_tokens 对应的 canonical source JSON；每个 canonical JSON 内的所有 section 和条件块媒体都纳入 manifest，覆盖 SaaS/BYOC 的并集。
- 显式拉取单篇文档时，prefetch 接受 --doc-token，通过 source snapshot 的 doc_token 到 source_file 映射只扫描该 canonical 文档。
- 零变更 plan 生成空 manifest，两个 render 不重写文档，也不发生媒体请求。

### Render 约束

- SaaS 与 BYOC 恢复同一份 enriched source artifact 后继续并行。
- `larkImageDownloader` 优先读取 manifest；命中时不得再次调用飞书/Figma。
- production render 开启 strict 模式；manifest miss 立即失败，不能 fallback 到外部请求。
- 非 guides/manual 本地命令保持原有下载行为。

## Publication Queue

### 并行部分

- 内容获取、render、翻译 agent、MDX 校验和完整 Docusaurus build 保持并行。
- checkpoint artifact 在进入 publisher 前必须已经验证。

### 串行部分

通过 `fetch-docs.yml` 的显式 `needs` 链排队所有向 `dev` 写入的 publisher。source publisher 顺序为 Java、Node、Go、CLI、REST、Python、Guides，把耗时较长的 Python 与 Guides 放在最后两个提交位；所有 producer 仍同时运行。每个 publisher 只执行：

1. 下载并验证 checkpoint/baseline artifact。
2. 获取最新 `dev`。
3. 三方应用 checkpoint 和翻译缓存。
4. 执行 sidebar + 当前 group translation coverage 的快速校验。
5. commit 和 push；non-fast-forward 时基于最新 `dev` 重试。

完整站点构建不在串行重试窗口内重复执行。所有提交完成后，`_verify-docs.yml` 对不可变 final dev SHA 执行完整构建。

Guides durable translation batches 先以 matrix 并行生成 checkpoint/baseline artifacts，再由一个短 publisher job 按 batch number 依次提交；不得通过 matrix max-parallel 串行 translation。

## 失败语义

- Prefetch 失败：不启动两个 render。
- Render manifest miss：失败并报告缺失媒体身份。
- Publisher 失败：后续队列节点使用 `always()` 启动条件，但只在自身 artifact ready 时发布；最终 aggregate 明确失败。
- Final verify 失败：保留已发布 checkpoint 和验证报告，不隐式回滚 `dev`。

## 测试

- 纯函数测试媒体引用扫描、去重和 manifest 校验。
- Downloader 测试 strict manifest 命中不访问网络、miss 明确失败。
- Workflow policy 测试两个 render 保持并行且共享 media artifact。
- Prefetch 测试全量、增量、单篇范围选择和有限并发。
- Workflow policy 测试 producer/translator 独立并行、publisher 显式排队、发布校验不包含 `pnpm run build`。
- DAG 无环检查、现有 checkpoint contention 测试和完整核心回归。
