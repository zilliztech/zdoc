<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>field_name</code></p></td>
     <td><p>The name of the vector field to index. For full text search, this should be the field that stores the generated sparse vectors. In this example, set the value to <code>sparse</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>index_type</code></p></td>
     <td><p>The type of the index to create. <code>AUTOINDEX</code> allows Zilliz Cloud to automatically optimize index settings. If you need more control over your index settings, you can choose from various index types available for sparse vectors in Zilliz Cloud. .</p></td>
   </tr>
   <tr>
     <td><p><code>metric_type</code></p></td>
     <td><p>The value for this parameter must be set to <code>BM25</code> specifically for full text search functionality.</p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>A dictionary of additional parameters specific to the index.</p></td>
   </tr>
   <tr>
     <td><p><code>params.inverted_index_algo</code></p></td>
     <td><p>The algorithm used for building and querying the index. Valid values:</p><ul><li><p><code>&quot;DAAT_MAXSCORE&quot;</code> (default): Optimized Document-at-a-Time (DAAT) query processing using the MaxScore algorithm. MaxScore provides better performance for high <em>k</em> values or queries with many terms by skipping terms and documents likely to have minimal impact. It achieves this by partitioning terms into essential and non-essential groups based on their maximum impact scores, focusing on terms that can contribute to the top-k results.</p></li><li><p><code>&quot;DAAT_WAND&quot;</code>: Optimized DAAT query processing using the WAND algorithm. WAND evaluates fewer hit documents by leveraging maximum impact scores to skip non-competitive documents, but it has a higher per-hit overhead. This makes WAND more efficient for queries with small <em>k</em> values or short queries, where skipping is more feasible.</p></li><li><p><code>&quot;TAAT_NAIVE&quot;</code>: Basic Term-at-a-Time (TAAT) query processing. While it is slower compared to <code>DAAT_MAXSCORE</code> and <code>DAAT_WAND</code>, <code>TAAT_NAIVE</code> offers a unique advantage. Unlike DAAT algorithms, which use cached maximum impact scores that remain static regardless of changes to the global collection parameter (avgdl), <code>TAAT_NAIVE</code> dynamically adapts to such changes.</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.bm25_k1</code></p></td>
     <td><p>Controls the term frequency saturation. Higher values increase the importance of term frequencies in document ranking. Value range: [1.2, 2.0].</p></td>
   </tr>
   <tr>
     <td><p><code>params.bm25_b</code></p></td>
     <td><p>Controls the extent to which document length is normalized. Values between 0 and 1 are typically used, with a default value of 0.75. A value of 0 means no length normalization, while a value of 1 means full length normalization.</p></td>
   </tr>
</table>
