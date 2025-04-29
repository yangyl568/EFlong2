//目前存在一个问题，仅在访问首页或者刷新页面时，才会触发百度统计。

//因为 vuepress 是基于 vue 的单页面应用，所以页面切换过程中，不会重新加载页面，故而不会触发百度统计。


export default ({ router }) => {
    /**
     * 路由切换事件处理
     */
    router.beforeEach((to, from, next) => {
        console.log("切换路由", to.fullPath, from.fullPath);

        //触发百度的pv统计
        if (typeof _hmt != "undefined") {
            if (to.path) {
                _hmt.push(["_trackPageview", to.fullPath]);
                console.log("上报百度统计", to.fullPath);
            }
        }

        // continue
        next();
    });
};
