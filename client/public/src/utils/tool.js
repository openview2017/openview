/**
 * Created by su on 4/6/17.
 */

 class Tool {

    constructor(){
        this.unitMap = {};
        let unit1 = {
            times:1024,
            unitList:['B','KB','MB','GB'],
            strLength:2
        }

        let unit2 = {
            unitList:['times/s']
        }

        let unit3 = {
            unitList:['blocks/s']
        }

        let unit4 = {
            unitList:['/s']
        }

        let  unit5 = {
            times: 1024,
            unitList:['Bps','KBps','MBps','GBps'],
            strLength:2
        }

        let  unit6 = {
            unitList:['req/s'],
        }

        let unit7 = {
            unitList:['times/s']
        }

        let unit8 = {
            unitList:['%']
        }

        let unit9 = {
            unitList:['s'],
            initTimes:100000000,
            strLength:3
        }

        let unit10 = {
            unitList:['G periods'],
            initTimes:1000000000000,
            strLength:3
        }

        let arrary = [
            {
                value:unit1,
                key:[
                    "mem_cache",
                    "mem_mapped_file",
                    "mem_total_inactive_file",
                    "mem_rss",
                    "mem_total_mapped_file",
                    "mem_writeback",
                    "mem_unevictable",
                    "mem_total_unevictable",
                    "mem_total_rss",
                    "mem_total_rss_huge",
                    "mem_total_writeback",
                    "mem_total_inactive_anon",
                    "mem_rss_huge",
                    "mem_hierarchical_memory_limit",
                    "mem_total_active_file",
                    "mem_active_anon",
                    "mem_total_active_anon",
                    "mem_total_cache",
                    "mem_inactive_anon",
                    "mem_active_file",
                    "mem_inactive_file",
                    "mem_max_usage",
                    "mem_limit",
                    "mem_usage",
                ]
            },{
                value:unit2,
                key:[
                    "mem_total_pgmafault_rate",
                    "mem_pgmajfault_rate",
                    "mem_total_pgfault_rate",
                ]
            },
            {
                value:unit3,
                key:[
                    "mem_pgpgout_rate",
                    "mem_pgpgin_rate",
                    "mem_total_pgpgout_rate",
                    "mem_pgfault_rate",
                    "mem_total_pgpgin_rate",
                ]
            },
            {
                value:unit4,
                key:[
                    "mem_failcnt_rate",
                ]
            },
            {
                value: unit5,
                key: [
                    "blkio_io_service_bytes_recursive_async_rate",
                    "blkio_io_service_bytes_recursive_read_rate",
                    "blkio_io_service_bytes_recursive_sync_rate",
                    "blkio_io_service_bytes_recursive_total_rate",
                    "blkio_io_service_bytes_recursive_write_rate",
                ]
            },{
                value:unit6,
                key:[
                    "blkio_io_serviced_recursive_async_rate",
                    "blkio_io_serviced_recursive_read_rate",
                    "blkio_io_serviced_recursive_sync_rate",
                    "blkio_io_serviced_recursive_total_rate",
                    "blkio_io_serviced_recursive_write_rate",
                ]
            }, {
               value:unit7,
                key:[
                    "cpu_throttling_periods",
                    "cpu_throttling_throttled_periods",
                ]
            },{
                value:unit8,
                key:[
                    "cpu_usage_percent",
                    "mem_usage_percent"
                ]
            },{
                value:unit9,
                key:[
                    "cpu_throttling_throttled_time"
                ]
            },{
                value:unit10,
                key:[
                    "cpu_usage_in_kernelmode_rate",
                    "cpu_usage_in_usermode_rate",
                    "cpu_usage_system_rate",
                    "cpu_usage_total_rate",
                ]
            }
        ]

        let _this = this;
        arrary.forEach(function(item){
            let value = item.value;
            item.key.forEach(function (keyStr) {
                _this.unitMap[keyStr] = value;
            })
        })

    }


    currencyConversion(target,source,num){
        if(target == source){
            return parseFloat(parseFloat(num).toFixed(2));
        }
        let currencyMap = {
            'yuan':1,
            'dollar':7
        }
        return parseFloat((parseFloat(num) * currencyMap[source] / currencyMap[target]).toFixed(2));
    }

    getCurrencyDisplay(currency){
        let displayMap = {'dollar':'$','yuan':'￥'};
        return displayMap[currency];
    }

    capitalizeFirstLetter(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    addUnit(value,type){
        value = parseFloat(value);
        let typeArr = type.split('_');
        let typeShort = typeArr.slice(0,typeArr.length - 1).join("_");
        var unit = this.unitMap[typeShort] ?  this.unitMap[typeShort] : this.unitMap[type];
        if(unit){
            var fix = unit.strLength ? unit.strLength : 0;
            var str = "";
            if(unit.initTimes){
                value = value / unit.initTimes;
            }
            if(unit.unitList.length == 1){
                if(value % 1 == 0){
                    str = value.toString() + " " + unit.unitList[0];
                }else{
                    str = value.toFixed(fix) + " " + unit.unitList[0];
                }

            }else{
                var idx = 0;
                console.log(unit);
                while (value / unit.times >= 1 && idx < unit.unitList.length - 1){
                    idx ++;
                    value = value / unit.times;
                }
                if(value % 1 == 0){
                    str = value.toString() + " " + unit.unitList[idx];
                }else{
                    str = value.toFixed(fix) + " " + unit.unitList[idx];
                }

            }
            return str;
        }else{
            return value.toString();
        }

    }
}
const tool = new Tool();
export default tool;