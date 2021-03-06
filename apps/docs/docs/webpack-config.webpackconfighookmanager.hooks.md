<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@hadeshe93/webpack-config](./webpack-config.md) &gt; [WebpackConfigHookManager](./webpack-config.webpackconfighookmanager.md) &gt; [hooks](./webpack-config.webpackconfighookmanager.hooks.md)

## WebpackConfigHookManager.hooks property

<b>Signature:</b>

```typescript
hooks: {
        start: AsyncParallelHook<WebpackManagerHookStartInfo, import("tapable").UnsetAdditionalOptions>;
        beforeNewPlugin: AsyncSeriesWaterfallHook<BeforeNewPluginOptions, import("tapable").UnsetAdditionalOptions>;
        beforeMerge: AsyncSeriesWaterfallHook<CustomedWebpackConfigs, import("tapable").UnsetAdditionalOptions>;
        afterMerge: AsyncSeriesWaterfallHook<CustomedWebpackConfigs, import("tapable").UnsetAdditionalOptions>;
        context: AsyncSeriesWaterfallHook<string, import("tapable").UnsetAdditionalOptions>;
        mode: AsyncSeriesWaterfallHook<string, import("tapable").UnsetAdditionalOptions>;
        entry: AsyncSeriesWaterfallHook<Entry, import("tapable").UnsetAdditionalOptions>;
        output: AsyncSeriesWaterfallHook<Outputs, import("tapable").UnsetAdditionalOptions>;
        module: AsyncSeriesWaterfallHook<Module, import("tapable").UnsetAdditionalOptions>;
        resolve: AsyncSeriesWaterfallHook<Resolve, import("tapable").UnsetAdditionalOptions>;
        optimization: AsyncSeriesWaterfallHook<Optimization, import("tapable").UnsetAdditionalOptions>;
        plugins: AsyncSeriesWaterfallHook<(((this: import("webpack").Compiler, compiler: import("webpack").Compiler) => void) | import("webpack").WebpackPluginInstance)[], import("tapable").UnsetAdditionalOptions>;
        devServer: AsyncSeriesWaterfallHook<DevServer, import("tapable").UnsetAdditionalOptions>;
        cache: AsyncSeriesWaterfallHook<Cache, import("tapable").UnsetAdditionalOptions>;
        devtool: AsyncSeriesWaterfallHook<DevTool, import("tapable").UnsetAdditionalOptions>;
        target: AsyncSeriesWaterfallHook<Target, import("tapable").UnsetAdditionalOptions>;
        watch: AsyncSeriesWaterfallHook<Watch, import("tapable").UnsetAdditionalOptions>;
        watchOptions: AsyncSeriesWaterfallHook<WatchOptions, import("tapable").UnsetAdditionalOptions>;
        externals: AsyncSeriesWaterfallHook<any, import("tapable").UnsetAdditionalOptions>;
        performance: AsyncSeriesWaterfallHook<any, import("tapable").UnsetAdditionalOptions>;
        node: AsyncSeriesWaterfallHook<any, import("tapable").UnsetAdditionalOptions>;
        stats: AsyncSeriesWaterfallHook<Stats, import("tapable").UnsetAdditionalOptions>;
    };
```
