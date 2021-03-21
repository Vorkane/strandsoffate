/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class BoilerplateActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["boilerplate", "sheet", "actor"],
      template: "systems/strandsoffate/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "abilities" }]
    });
  }

  /* -------------------------------------------- */


  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    for (let attr of Object.values(data.data.attributes)) {
      attr.isCheckbox = attr.dtype === "Boolean";
    }

    // Prepare items.
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
    }

    return data;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const skills = [];
    const gear = [];
    const aspects = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    };

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'skill') {
        skills.push(i);
      }
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'aspect') {
        aspects.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.data.spellLevel != undefined) {
          spells[i.data.spellLevel].push(i);
        }
      }
    }

    // Assign and return
    actorData.skills = skills;
    actorData.gear = gear;
    actorData.aspects = aspects;
    actorData.spells = spells;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    html.find('.skill-roll').click(this._onSkillRoll.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("item-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */

  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.data.data);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  _onSkillRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    let confirmed = false;
    let ability_stat = "";

    if (dataset.roll) {

      new Dialog({
        title: "Roll d20 + modifier",
        content: `
        <form>
        <div class="form-group">
        <label>Roll Modifier:</label>
        <input id="modifier-value" name="modifier-value"></input>
        </div>
        </form>
        `,
        buttons: {
          agility: {
            icon: '<i class="fas fa-check"></i>',
            label: "Agility",
            callback: () => ability_stat = "@abilities.agility.value"
            //callback: () => ability_stat = "data.abilities.agility.value"
          },
          body: {
            icon: '<i class="fas fa-check"></i>',
            label: "Body",
            callback: () => ability_stat = "@abilities.body.value"
          },
          charisma: {
            icon: '<i class="fas fa-check"></i>',
            label: "Charmisma",
            callback: () => ability_stat = "@abilities.charisma.value"
          },
          intuition: {
            icon: '<i class="fas fa-check"></i>',
            label: "Intuition",
            callback: () => ability_stat = "@abilities.intuition.value"
          },
          logic: {
            icon: '<i class="fas fa-check"></i>',
            label: "Logic",
            callback: () => ability_stat = "@abilities.logic.value"
          },
          magic: {
            icon: '<i class="fas fa-check"></i>',
            label: "Magic",
            callback: () => ability_stat = "@abilities.magic.value"
          },
          reaction: {
            icon: '<i class="fas fa-check"></i>',
            label: "Reaction",
            callback: () => ability_stat = "@abilities.reaction.value"
          },
          strength: {
            icon: '<i class="fas fa-check"></i>',
            label: "Strength",
            callback: () => ability_stat = "@abilities.strength.value"
          },
          willpower: {
            icon: '<i class="fas fa-check"></i>',
            label: "Willpower",
            callback: () => ability_stat = "@abilities.willpower.value"
          },
        },
        default: "Cancel",
        close: html => {
          if (ability_stat != "") {
            let rollModifier = parseInt(html.find('[name=modifier-value]')[0].value);
            if (!rollModifier){
              console.log(ability_stat);
              let roll = new Roll(dataset.roll + "+" + ability_stat, this.actor.data.data);
              let label = dataset.label ? `Rolling ${dataset.label}` : '';
              roll.roll().toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: label
              });
            }else{
              let roll = new Roll(dataset.roll + "+" + ability_stat + " + " + rollModifier, this.actor.data.data);
              let label = dataset.label ? `Rolling ${dataset.label}` : '';
              roll.roll().toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: label
              });
            }

          }
        }
      }).render(true);

      //let roll = new Roll(dataset.roll, this.actor.data.data);
    //  let label = dataset.label ? `Rolling ${dataset.label}` : '';
      //roll.roll().toMessage({
      //  speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //    flavor: label
    //  });
    }
  }
}
