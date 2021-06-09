// cost at 2021/06/09.
// see: https://cloud.google.com/bigquery/pricing#on_demand_pricing
const QUERY_TB_COST_BY_REGION = {
    "US": 5.0,
    "EU": 5.0,
    'us-west4': 5.0,
    'us-west2': 6.75,
    'northamerica-northeast1': 5.25,
    'us-east4': 5.0,
    'us-west': 5.0,
    'us-west3': 6.75,
    'southamerica-east1': 9.0,
    'us-east1': 5.0,
    'europe-west1': 6.0,
    'europe-north1': 6.0,
    'europe-west3': 6.5,
    'europe-west2': 6.25,
    'europe-west4': 6.0,
    'europe-central2': 6.5,
    'europe-west6': 7.0,
    'asia-east2': 7.0,
    'asia-southeast2': 6.0,
    'asia-south1': 6.0,
    'asia-northeast2': 6.0,
    'asia-northeast3': 6.0,
    'asia-southeast1': 6.75,
    'australia-southeast1': 6.5,
    'asia-east1': 5.75,
    'asia-northeast1': 6.0
}
const DEFAULT_TB_COST = 5.0
const costBlockId = 'estimated_cost'

var loadfunction = window.onload
window.onload = function(event){
    observeDataLoadAmount()

    if(loadfunction) loadfunction(event)
}

function observeDataLoadAmount() {
    let observeTargetDiv = document.querySelector('query-validation-status')
    let targetDiv = document.querySelector('div.query-validation-status')
    let appended = false

    function subscriber(mutations) {
        let statusIcon = document.querySelector('div.query-validation-status > button > span > div > ace-icon')
        let status = statusIcon.getAttribute("icon")

        switch (status) {
            case "status-success":
                appendCostBlock()
                break;
            case "working":
            case "status-error":
                removeCostBlock()
                break
            default:
                removeCostBlock()
        }
    }

    function calcCost() {
        let loadAmountBlock = document.querySelector('div.query-validation-status > .cfc-truncated-text')
        let expectedLoadAmount = loadAmountBlock.innerText.match(/\d+(.\d+)?\s[a-zA-Z]+/g)

        let result = expectedLoadAmount[0].split(" ")
        let usage = result[0]
        let unit = result[1]

        switch (unit) {
            case "KiB":
                usage = usage / 1024 / 1024 / 1024
                break
            case "MiB":
                usage = usage / 1024 / 1024
                break
            case "GiB":
                usage = usage / 1024
                break
            case "TiB":
                usage = usage
                break
            case "PiB":
                usage = usage * 1024
                break
            default:
        }

        let regionBlock = document.querySelector('bqui-query-chips > mat-chip-set > mat-chip > div > div.mdc-chip__text')
        let region = ""

        if(regionBlock) {
            region = regionBlock.innerText.split(":")[1].replace(/\s+/g, '')
        }

        let costByTB = QUERY_TB_COST_BY_REGION[region] || DEFAULT_TB_COST

        let costs = new Intl.NumberFormat('nl-NL', {
                style: 'currency',
                currency: 'USD'
            })
            .format(usage * costByTB)

        return costs
    }

    function appendCostBlock() {
        let costs = calcCost()

        let innerDiv = document.createElement('div')
        innerDiv.innerHTML = "Estimated cost: " + costs
        innerDiv.id = costBlockId

        targetDiv.appendChild(innerDiv)
        appended = true
    }

    function removeCostBlock() {
        let targetBlock = document.getElementById(costBlockId)
        
        if (appended === true && targetBlock) {
            targetDiv.removeChild(document.getElementById(costBlockId))
            appended = false
        }
    }

    const observer = new MutationObserver(subscriber)
    if (!observeTargetDiv) {
        window.setTimeout(observeDataLoadAmount, 500)
        return
    }
    observer.observe(document.querySelector('div.query-validation-status > button > span > div'), { childList: true })
}