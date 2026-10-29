


export default function getPrimaryMission(detachment_player, detachment_oponent) {
    const missions = {
        "take_and_hold+take_and_hold": "battlefield_dominance",
        "take_and_hold+purge_the_foe": "determined_acquisition",
        "take_and_hold+reconnaissance": "immovable_object",
        "take_and_hold+priority_assets": "inescapable_dominion",
        "take_and_hold+disruption": "purge_and_secure",

        "purge_the_foe+reconnaissance": "consecrate",
        "purge_the_foe+priority_assets": "destroyers_wrath",
        "purge_the_foe+purge_the_foe": "meatgrinder",
        "purge_the_foe+disruption": "punishment",
        "purge_the_foe+take_and_hold": "unstopable_force",

        "reconnaissance+reconnaissance": "gather_intel",
        "reconnaissance+take_and_hold": "reconnaissance_sweep",
        "reconnaissance+priority_assets": "search_and_scour",
        "reconnaissance+disruption": "surveil_the_foe",
        "reconnaissance+purge_the_foe": "triangulation",

        "priority_assets+disruption": "extract_relic",
        "priority_assets+priority_assets": "sabotage",
        "priority_assets+take_and_hold": "secure_assets",
        "priority_assets+reconnaissance": "vanguard_operation",
        "priority_assets+purge_the_foe": "vital_link",

        "disruption+take_and_hold": "death_trap",
        "disruption+purge_the_foe": "delaying_action",
        "disruption+priority_assets": "locate_and_deny",
        "disruption+disruption": "outmanoeuvre",
        "disruption+reconnaissance": "smoke_and_mirrors"
    };

    const key = `${detachment_player}+${detachment_oponent}`;
    return missions[key] || null;
}