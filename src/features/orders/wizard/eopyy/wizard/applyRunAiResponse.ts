import {
  applyLastOrderData,
  applyPersonErpGIDFromLastOrder,
  extractAddressErpGID,
  extractPersonErpGID,
  extractShipToOtherAddress,
  normalizeZeroOne,
  syncShipToOtherAddressFlags,
} from "@/lib/applyLastOrderData";
import { hasText, isBlank, trimmedString } from "@/lib/utils/string";
import { hasAnyValue, normalizeBarcode, normalizeSymmPercentage } from "./wizardUtils";
import {
  clearDraftAddressesList,
  loadCustomerAddressesAsync,
  setAIMaterials,
  setDraftFiles,
  setDraftProperty,
  setDraftYlika,
  setCustomerProsEbs,
  setCustomerSelectedFromList,
  setCustomerIsCompletelyNew,
  setLastOrderInfoCustomerErpGID,
  setLastWebOrderFromLoadInfo,
} from "@/store/orders/ordersSlice";
import type { AppDispatch } from "@/store/store";
import { store } from "@/store/store";
import type { ReadEoppyDoc_Response } from "@/types/api/schemas";
import type {
  AIMaterials as AIMaterialsType,
  OrderFile,
  OrderYlika,
} from "@/types/orders";
import {
  findAddressPersonByAmka,
  getCustomerMobileFromAddressPerson,
  getCustomerPassportFromAddressPerson,
} from "./customerAddressesUtils";
import type { OrderListOfAddressPersons } from "@/types/orders";

export async function applyRunAiResponse(
  dispatch: AppDispatch,
  data: ReadEoppyDoc_Response,
): Promise<void> {
  if (!data.isSuccess || !data.jsonDoc) return;

  dispatch(setDraftYlika([]));
  dispatch(setAIMaterials([]));
  dispatch(setLastOrderInfoCustomerErpGID(undefined));
  dispatch(setCustomerProsEbs(undefined));
  dispatch(setCustomerSelectedFromList(undefined));
  dispatch(setCustomerIsCompletelyNew(true));
  dispatch(setLastWebOrderFromLoadInfo(undefined));
  dispatch(clearDraftAddressesList());

  const personErpIdFromJson = hasText(data.jsonDoc.person_erpid)
    ? trimmedString(data.jsonDoc.person_erpid)
    : null;
  const addressErpIdFromJson = hasText(data.jsonDoc.address_erpid)
    ? trimmedString(data.jsonDoc.address_erpid)
    : null;

  dispatch(setDraftProperty({ key: "aiCalculated", value: true }));
  dispatch(
    setDraftProperty({
      key: "hasAnoia",
      value: Boolean(data.jsonDoc.hasAnoia),
    }),
  );

  const lastWebOrderRaw =
    data.jsonDoc.last_web_order &&
    typeof data.jsonDoc.last_web_order === "object" &&
    !Array.isArray(data.jsonDoc.last_web_order)
      ? (data.jsonDoc.last_web_order as Record<string, unknown>)
      : undefined;

  if (lastWebOrderRaw) {
    applyLastOrderData(lastWebOrderRaw, dispatch);
  }

  const lastOrderInfo = data.jsonDoc?.last_order_info;
  const hasLastOrderInfo =
    lastOrderInfo &&
    typeof lastOrderInfo === "object" &&
    !Array.isArray(lastOrderInfo) &&
    Object.keys(lastOrderInfo).length > 0;

  let customerAddressesLoaded = false;

  if (hasLastOrderInfo) {
    const raw = lastOrderInfo as Record<string, unknown>;
    const orderObj =
      raw?.order &&
      typeof raw.order === "object" &&
      !Array.isArray(raw.order)
        ? (raw.order as Record<string, unknown>)
        : raw?.data &&
            typeof raw.data === "object" &&
            !Array.isArray(raw.data)
          ? (raw.data as Record<string, unknown>)
          : raw;

    dispatch(
      setLastOrderInfoCustomerErpGID(
        (orderObj.customer_ErpGID ?? raw.customer_ErpGID) as string,
      ),
    );
    applyLastOrderData(orderObj, dispatch);
    if (Array.isArray(orderObj?.items ?? orderObj?.ylika)) {
      dispatch(setDraftYlika((orderObj.items ?? orderObj.ylika) as OrderYlika[]));
    }
    if (Array.isArray(orderObj?.ai_ylika)) {
      dispatch(setAIMaterials(orderObj.ai_ylika as AIMaterialsType[]));
    }
    if (Array.isArray(raw?.files ?? orderObj?.files)) {
      dispatch(setDraftFiles((raw.files ?? orderObj.files) as OrderFile[]));
    }
    const pick = (...keys: string[]) =>
      keys.reduce(
        (v: unknown, k) => v ?? raw[k] ?? orderObj[k],
        undefined as unknown,
      );
    const hasOther = pick(
      "has_other_recipient",
      "hasOtherRecipient",
      "Has_Other_Recipient",
    );
    if (hasOther !== undefined && hasOther !== null)
      dispatch(
        setDraftProperty({
          key: "has_other_recipient",
          value: normalizeZeroOne(hasOther),
        }),
      );
    const shipOther = pick(
      "shipTo_other_address",
      "shipToOtherAddress",
      "ShipTo_Other_Address",
    );
    if (shipOther !== undefined && shipOther !== null)
      dispatch(
        setDraftProperty({
          key: "shipTo_other_address",
          value: normalizeZeroOne(shipOther),
        }),
      );
    const delSun = pick("deliverySunday", "delivery_sunday");
    if (delSun !== undefined && delSun !== null)
      dispatch(
        setDraftProperty({
          key: "deliverySunday",
          value: normalizeZeroOne(delSun),
        }),
      );
    const delMorn = pick("deliveryMorning", "delivery_morning");
    if (delMorn !== undefined && delMorn !== null)
      dispatch(
        setDraftProperty({
          key: "deliveryMorning",
          value: normalizeZeroOne(delMorn),
        }),
      );

    const shipToFromLastOrder = extractShipToOtherAddress(
      orderObj,
      raw,
      lastWebOrderRaw,
    );
    const personFromLastOrder = extractPersonErpGID(
      orderObj,
      raw,
      lastWebOrderRaw,
    );
    const addressFromLastOrder = extractAddressErpGID(
      orderObj,
      raw,
      lastWebOrderRaw,
    );

    const lastOrderAmka = String(
      orderObj.customer_amka ?? raw.customer_amka ?? "",
    ).trim();
    const lastGid = String(
      orderObj.customer_ErpGID ?? raw.customer_ErpGID ?? "",
    ).trim();
    if (lastOrderAmka && lastGid) {
      try {
        await dispatch(
          loadCustomerAddressesAsync({
            customer_ErpGID: lastGid,
            customer_name:
              orderObj.customer_name != null
                ? String(orderObj.customer_name)
                : undefined,
            customer_address:
              orderObj.customer_address != null
                ? String(orderObj.customer_address)
                : undefined,
            customer_amka: lastOrderAmka,
            preferredPersonErpGID:
              personErpIdFromJson ?? personFromLastOrder,
            preferredAddressErpGID:
              addressErpIdFromJson ?? addressFromLastOrder,
          }),
        ).unwrap();
        customerAddressesLoaded = true;

        if (shipToFromLastOrder === 1) {
          syncShipToOtherAddressFlags(dispatch, 1);
          applyPersonErpGIDFromLastOrder(dispatch, personFromLastOrder);
          const prePerson =
            store.getState().orders.draft.preselected_person_GID;
          if (
            !store.getState().orders.draft.order.person_ErpGID?.trim() &&
            prePerson
          ) {
            dispatch(
              setDraftProperty({
                key: "person_ErpGID",
                value: prePerson,
              }),
            );
          }
        } else {
          dispatch(
            setDraftProperty({ key: "shipTo_other_address", value: 0 }),
          );
          dispatch(
            setDraftProperty({ key: "has_other_recipient", value: 0 }),
          );
        }
      } catch {
        if (shipToFromLastOrder === 1) {
          syncShipToOtherAddressFlags(dispatch, 1);
          applyPersonErpGIDFromLastOrder(dispatch, personFromLastOrder);
        }
      }
    }
  }

  const jsonDoc = data.jsonDoc;

  jsonDoc.amka_eksetazomenou &&
    dispatch(
      setDraftProperty({
        key: "customer_amka",
        value: jsonDoc.amka_eksetazomenou,
      }),
    );
  jsonDoc.onomateponymo_eksetazomenou &&
    dispatch(
      setDraftProperty({
        key: "customer_name",
        value: jsonDoc.onomateponymo_eksetazomenou,
      }),
    );
  jsonDoc.diefthinsi_eksetazomenou &&
    dispatch(
      setDraftProperty({
        key: "customer_address",
        value: jsonDoc.diefthinsi_eksetazomenou,
      }),
    );
  jsonDoc.poli_eksetazomenou &&
    dispatch(
      setDraftProperty({
        key: "customer_city",
        value: jsonDoc.poli_eksetazomenou,
      }),
    );
  jsonDoc.tk_eksetazomenou &&
    dispatch(
      setDraftProperty({
        key: "customer_tk",
        value: jsonDoc.tk_eksetazomenou,
      }),
    );
  jsonDoc.tilefono_eksetazomenou &&
    dispatch(
      setDraftProperty({
        key: "customer_tel",
        value: jsonDoc.tilefono_eksetazomenou,
      }),
    );
  if (!hasLastOrderInfo && hasText(jsonDoc.tilefono_eksetazomenou)) {
    dispatch(
      setDraftProperty({
        key: "customer_mobile",
        value: trimmedString(jsonDoc.tilefono_eksetazomenou),
      }),
    );
  } else if (hasText(jsonDoc.customer_tel)) {
    const mobile = store.getState().orders.draft.order.customer_mobile;
    if (isBlank(mobile)) {
      dispatch(
        setDraftProperty({
          key: "customer_mobile",
          value: trimmedString(jsonDoc.customer_tel),
        }),
      );
    }
  }
  jsonDoc.email_eksetazomenou &&
    dispatch(
      setDraftProperty({
        key: "customer_email",
        value: jsonDoc.email_eksetazomenou,
      }),
    );
  jsonDoc.imerominia_gennisis &&
    dispatch(
      setDraftProperty({
        key: "customer_dob",
        value: jsonDoc.imerominia_gennisis,
      }),
    );
  jsonDoc.otp &&
    dispatch(
      setDraftProperty({
        key: "customer_tel_otp",
        value: jsonDoc.otp,
      }),
    );
  hasText(jsonDoc.customer_erpid)
    ? dispatch(
        setDraftProperty({
          key: "customer_ErpGID",
          value: trimmedString(jsonDoc.customer_erpid),
        }),
      )
    : dispatch(
        setDraftProperty({
          key: "customer_ErpGID",
          value: null,
        }),
      );
  const personErpId = personErpIdFromJson;
  dispatch(setDraftProperty({ key: "person_erpid", value: personErpId }));
  const customerErpIdFromJson = hasText(jsonDoc.customer_erpid)
    ? trimmedString(jsonDoc.customer_erpid)
    : null;
  const prosEbs = Boolean(hasLastOrderInfo && personErpId == null);
  dispatch(setCustomerProsEbs(prosEbs));
  dispatch(setCustomerIsCompletelyNew(!customerErpIdFromJson && !prosEbs));
  dispatch(setCustomerSelectedFromList(false));

  const doctor = jsonDoc.iatros;
  if (doctor) {
    doctor.amka_iatrou &&
      dispatch(
        setDraftProperty({
          key: "doctor_amka",
          value: doctor.amka_iatrou,
        }),
      );
    doctor.onomateponymo_iatrou &&
      dispatch(
        setDraftProperty({
          key: "doctor_name",
          value: doctor.onomateponymo_iatrou,
        }),
      );
    doctor.afm_iatrou &&
      dispatch(
        setDraftProperty({ key: "doctor_afm", value: doctor.afm_iatrou }),
      );
    doctor.doctor_erpid &&
      dispatch(
        setDraftProperty({
          key: "doctor_ErpGID",
          value: doctor.doctor_erpid,
        }),
      );
    doctor.typos_domis &&
      dispatch(
        setDraftProperty({
          key: "doctor_DomiTypos",
          value: doctor.typos_domis,
        }),
      );
    doctor.ygeionomiki_domi &&
      dispatch(
        setDraftProperty({
          key: "doctor_Domi",
          value: doctor.ygeionomiki_domi,
        }),
      );
  }

  const suggestedDoctor = jsonDoc.systinon_iatros;
  const hasSuggestedDoctor = suggestedDoctor
    ? hasAnyValue(suggestedDoctor as Record<string, unknown>)
    : null;
  hasSuggestedDoctor &&
    dispatch(
      setDraftProperty({
        key: "hasOtherSystinonIatroBool",
        value: hasSuggestedDoctor,
      }),
    );
  hasSuggestedDoctor &&
    dispatch(
      setDraftProperty({
        key: "has_suggested_doctor",
        value: hasSuggestedDoctor ? 2 : 0,
      }),
    );
  if (hasSuggestedDoctor && suggestedDoctor) {
    suggestedDoctor.amka_iatrou &&
      dispatch(
        setDraftProperty({
          key: "doctorSuggested_amka",
          value: suggestedDoctor.amka_iatrou,
        }),
      );
    suggestedDoctor.onomateponymo_iatrou &&
      dispatch(
        setDraftProperty({
          key: "doctorSuggested_name",
          value: suggestedDoctor.onomateponymo_iatrou,
        }),
      );
    suggestedDoctor.afm_iatrou &&
      dispatch(
        setDraftProperty({
          key: "doctorSuggested_afm",
          value: suggestedDoctor.afm_iatrou,
        }),
      );
    suggestedDoctor.doctor_erpid &&
      dispatch(
        setDraftProperty({
          key: "doctorSuggested_ErpGID",
          value: suggestedDoctor.doctor_erpid,
        }),
      );
    suggestedDoctor.ygeionomiki_domi &&
      dispatch(
        setDraftProperty({
          key: "doctorSuggested_domi",
          value: suggestedDoctor.ygeionomiki_domi,
        }),
      );
    suggestedDoctor.tilefono &&
      dispatch(
        setDraftProperty({
          key: "doctorSuggested_tel",
          value: suggestedDoctor.tilefono,
        }),
      );
  }

  const gnomatevsi = jsonDoc.gnomateusi;
  if (gnomatevsi) {
    const barcode = normalizeBarcode(jsonDoc.barcode);
    if (barcode) {
      dispatch(setDraftProperty({ key: "barcode", value: barcode }));
    }
    gnomatevsi.imerominia_gnomateusis &&
      dispatch(
        setDraftProperty({
          key: "dateOfSyntagi",
          value: gnomatevsi.imerominia_gnomateusis,
        }),
      );
    gnomatevsi.diarkeia_isxyos_apo &&
      dispatch(
        setDraftProperty({
          key: "dateIsxyeiApo",
          value: gnomatevsi.diarkeia_isxyos_apo,
        }),
      );
    gnomatevsi.diarkeia_isxyos_eos &&
      dispatch(
        setDraftProperty({
          key: "dateIsxyeiEos",
          value: gnomatevsi.diarkeia_isxyos_eos,
        }),
      );
    gnomatevsi.katigoria_paroxis &&
      dispatch(
        setDraftProperty({
          key: "katigoriaParoxis",
          value: gnomatevsi.katigoria_paroxis,
        }),
      );
    gnomatevsi.eidos_egkrisis &&
      dispatch(
        setDraftProperty({
          key: "eidos_Egkrisis",
          value: gnomatevsi.eidos_egkrisis,
        }),
      );
    dispatch(
      setDraftProperty({
        key: "symmPercentage",
        value: normalizeSymmPercentage(gnomatevsi.symmetoxi_percentage),
      }),
    );
    dispatch(
      setDraftProperty({ key: "symm", value: gnomatevsi.symmetoxi }),
    );
    gnomatevsi.symmetoxi_percentage == 0 &&
      dispatch(
        setDraftProperty({ key: "eopyyVerifyNoParticipation", value: 0 }),
      );

    gnomatevsi.diagnosi1_gid &&
      dispatch(
        setDraftProperty({
          key: "diagnosi1_GID",
          value: gnomatevsi.diagnosi1_gid,
        }),
      );
    gnomatevsi.kodikos_diagnosis &&
      dispatch(
        setDraftProperty({
          key: "eoppy_Diagnosi_Code",
          value: gnomatevsi.kodikos_diagnosis,
        }),
      );
    gnomatevsi.perigrafi_diagnosis &&
      dispatch(
        setDraftProperty({
          key: "eoppy_Diagnosi_Name",
          value: gnomatevsi.perigrafi_diagnosis,
        }),
      );
    gnomatevsi.diagnosi2_gid &&
      dispatch(
        setDraftProperty({
          key: "diagnosi2_GID",
          value: gnomatevsi.diagnosi2_gid,
        }),
      );
    gnomatevsi.kodikos_diagnosis2 &&
      dispatch(
        setDraftProperty({
          key: "eoppy_Diagnosi2_Code",
          value: gnomatevsi.kodikos_diagnosis2,
        }),
      );
    gnomatevsi.perigrafi_diagnosis2 &&
      dispatch(
        setDraftProperty({
          key: "eoppy_Diagnosi2_Name",
          value: gnomatevsi.perigrafi_diagnosis2,
        }),
      );
    dispatch(
      setDraftProperty({
        key: "maxPosoKostousGiaSymmetoxi",
        value: gnomatevsi.max_poso_symmetoxis,
      }),
    );
    gnomatevsi.max_poso_symmetoxis != null &&
      gnomatevsi.max_poso_symmetoxis > 0 &&
      (await dispatch(
        setDraftProperty({ key: "plafonGiftAmount", value: 6 }),
      ));
  }

  const aiMaterials = jsonDoc.ylika as AIMaterialsType[] | undefined;
  if (Array.isArray(aiMaterials) && aiMaterials.length > 0) {
    const uniqueAiMaterials: AIMaterialsType[] = aiMaterials.filter(
      (x) => x.erp_products?.length === 1,
    );
    const nonUniqueAiMaterials: AIMaterialsType[] = aiMaterials.filter(
      (x) => x.erp_products?.length !== 1 || !x.erp_products,
    );

    const o = store.getState().orders.draft.order;
    const fromAi: OrderYlika[] = uniqueAiMaterials.map((m) => ({
      id: o.id,
      uid: o.uid,
      orderId: o.id,
      orderUID: o.uid,
      erpGid: m.erp_products[0].erp_gid || "",
      aiMatchedErpGid: m.erp_products[0].erp_gid || "",
      erpCode: m.erp_products[0].erp_code || "",
      erpName: m.erp_products[0].erp_name || "",
      erp_Price: m.erp_products[0].erp_price || 0,
      erp_EoppyPrice: m.erp_products[0].erp_eoppyprice || 0,
      qty: parseFloat(String(m.synoliki_posotita_eidous ?? 0)),
      eoppy_CleanName: m.clean_name,
      eoppy_Code: m.kodikos_ylikou,
      eoppy_Diagnosi_Code: m.kodikos_diagnosis,
      eoppy_Diagnosi_Name: m.perigrafi_diagnosis,
      eoppy_Diagnosi2_Code: m.kodikos_diagnosis2,
      eoppy_Diagnosi2_Name: m.perigrafi_diagnosis2,
      eoppy_DiarkiaTherapias: String(m.diarkeia_therapeias_se_mines),
      eoppy_SlugName: m.slug_name,
      eoppy_SynPosotita: String(m.synoliki_posotita_eidous),
      eoppy_AnatomPerioxi: m.anatomiki_perioxi,
      eoppy_Symmetoxi: m.symmetoxi,
      eoppy_Sxolia: m.sxolia,
      aiMatchedBy: m.matched_by,
      fuzzyMatched: m.fuzzy_matched,
    }));
    const ylikaBeforeAi = store.getState().orders.draft.ylika;
    dispatch(setDraftYlika([...ylikaBeforeAi, ...fromAi]));
    dispatch(setAIMaterials(nonUniqueAiMaterials));
  }

  if (!customerAddressesLoaded) {
    const o = store.getState().orders.draft.order;
    const gid = String(o.customer_ErpGID ?? "").trim();
    const amka = String(o.customer_amka ?? "").trim();
    if (gid && amka) {
      try {
        const addressResult = await dispatch(
          loadCustomerAddressesAsync({
            customer_ErpGID: gid,
            customer_name: o.customer_name,
            customer_address: o.customer_address,
            customer_amka: amka,
            preferredPersonErpGID: personErpIdFromJson,
            preferredAddressErpGID: addressErpIdFromJson,
          }),
        ).unwrap();

        if (!hasLastOrderInfo && addressResult.ok) {
          const addresses = (addressResult.addresses ??
            []) as OrderListOfAddressPersons[];
          const matchedPerson = findAddressPersonByAmka(addresses, amka);
          const passport = getCustomerPassportFromAddressPerson(matchedPerson);
          if (passport) {
            dispatch(
              setDraftProperty({
                key: "customer_passport",
                value: passport,
              }),
            );
          }
          const mobile = getCustomerMobileFromAddressPerson(matchedPerson);
          if (mobile && isBlank(store.getState().orders.draft.order.customer_mobile)) {
            dispatch(
              setDraftProperty({
                key: "customer_mobile",
                value: mobile,
              }),
            );
          }
        }
      } catch {
        // Address list is optional if search-address fails
      }
    }
  }
}
