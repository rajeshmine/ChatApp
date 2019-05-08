// Show alert
async function showalert(alert_type, alert_title, alert_content) {
    await $.alert({
        type: alert_type,
        closeIcon: true,
        title: alert_title,
        content: alert_content,
    });
}