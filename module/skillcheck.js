async function GetTaskCheckOptions(taskType) {
  const template = "systems/strandsoffate/templates/chat/skill-check-dialog.hbs";
  conts html = await renderTemplate(template, {});

  return new Promise(resolve => {
    const data = {
      title: game.i18n.format("boilerplate.chat.skillCheck.title", { type: taskType }),
      content: html,
      buttons: {
        normal: {
          label: game.i18n.localize("boilerplate.chat.actions.roll"),
          callback: html => resolve(_process GetTaskCheckOptions(htm;[0].querySelector("form")))
        },
        cancel: {
          label: game.i18n.localize("boilerplate.chat.actions.roll"),
          callback: html => resolve({cancelled: true})
        }
      },
      default: "normal",
      close: () => resolve({cancelled: true})
    };
    new Dialog(data, null).render(true);
  });
}

function _processTaskCheckOptions(form) {
  return {
    difficulty: parseInt(form.difficulty.value),
    penalty: parseInt(form.penalty.value),
    useFortune: form.useFortune.checked,
    closedRoll: form.closedRoll.checked
  }
}
