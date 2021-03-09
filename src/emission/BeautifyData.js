export default class BeautifyData {

 static addDateTimeFromMillis(data){
        data = data.map(entry => {
            var startDate = new Date(entry.start).toISOString ();
            var endDate = new Date(entry.end).toISOString ();

            console.log("date", new Date(entry.start));
            return {
                'StartDate': startDate,
                'endDate': endDate,
                'Reason': entry.reason,
                'Start': entry.start,
                'End': entry.end

            }
        });
        return data;
    }
}