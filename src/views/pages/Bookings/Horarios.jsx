import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardHeader,
  Row,
  Col,
  Input,
  Label,
  FormGroup,
} from "reactstrap";
import { fetchAllSchedules } from "../Bookings/service/bookingService";
import { getData } from "RestControllers/Controller";
import toast, { Toaster } from "react-hot-toast";
import ReactLoading from "react-loading";
import { overlayStyles, loaderContainerStyles } from "styles/commonStyles";

const diasSemana = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
};

const dayMapping = {
  MON: "monday",
  TUE: "tuesday",
  WED: "wednesday",
  THU: "thursday",
  FRI: "friday",
  SAT: "saturday",
};

const fetchCoaches = async () => {
  const res = await getData("GET", process.env.REACT_APP_BASE_URL + "accounts/users/coaches/");
  return res.data;
};

const updateScheduleCoach = async (scheduleId, payload) => {
  const url = `${process.env.REACT_APP_BASE_URL}studio/schedules/${scheduleId}/`;
  return await getData("PUT", url, {}, payload);
};

const AllSchedulesByDay = () => {
  const [schedules, setSchedules] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [coaches, setCoaches] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allSchedules, coachList] = await Promise.all([
          fetchAllSchedules(),
          fetchCoaches(),
        ]);
        setSchedules(allSchedules);
        setCoaches(coachList);
        groupByDay(allSchedules);
      } catch (error) {
        toast.error("Error al cargar horarios");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const groupByDay = (data) => {
    const days = {};
    data.forEach((item) => {
      const key = dayMapping[item.day?.toUpperCase()] || item.day?.toLowerCase();
      if (!days[key]) days[key] = [];
      days[key].push(item);
    });
    setGrouped(days);
  };

  const handleCoachChange = async (scheduleId, newCoachId) => {
    try {
      const current = schedules.find((s) => s.id === scheduleId);
      const payload = {
        day: current.day,
        class_type_id: current.class_type?.id,
        coach: newCoachId,
        time_slot: current.time_slot,
        capacity: current.capacity,
      };

      setUpdatingId(scheduleId);
      await updateScheduleCoach(scheduleId, payload);
      toast.success("Coach actualizado correctamente");

      const updated = schedules.map((s) =>
        s.id === scheduleId ? { ...s, coach: newCoachId } : s
      );
      setSchedules(updated);
      groupByDay(updated);
    } catch (error) {
      toast.error("Error al actualizar coach");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      {loading && (
        <div style={overlayStyles}>
          <div style={loaderContainerStyles}>
            <ReactLoading type="spin" color="white" height="40%" />
          </div>
        </div>
      )}
      <Toaster position="top-right" />

      <div className="content">
        <Row>
          <Col md="4" className="mb-4">
            <FormGroup>
              <Label for="daySelect">Filtrar por día:</Label>
              <Input
                id="daySelect"
                type="select"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                <option value="">-- Ver todos --</option>
                {Object.keys(diasSemana).map((day) => (
                  <option key={day} value={day}>
                    {diasSemana[day]}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>
        </Row>

        <Row>
          {Object.entries(grouped)
            .filter(([day]) => !selectedDay || selectedDay === day)
            .map(([day, items]) => (
              <Col md="12" key={day}>
                <h5 className=" text-uppercase mb-3">
                  {diasSemana[day] || day}
                </h5>
                <Row>
                  {items.map((schedule) => (
                    <Col md="4" key={schedule.id}>
                      <Card className="mb-3">
                        <CardHeader>
                          <strong>{schedule.class_type?.name || "Sin tipo"}</strong>
                        </CardHeader>
                        <CardBody>
                          <CardTitle>
                            {schedule.time_slot} — Capacidad: {schedule.capacity}
                          </CardTitle>
                          <Label for={`coach-${schedule.id}`}>Coach:</Label>
                          <Input
                            type="select"
                            id={`coach-${schedule.id}`}
                            value={schedule.coach || ""}
                            disabled={updatingId === schedule.id}
                            onChange={(e) =>
                              handleCoachChange(schedule.id, e.target.value)
                            }
                          >
                            <option value="">Seleccionar</option>
                            {coaches.map((coach) => (
                              <option key={coach.id} value={coach.id}>
                                {coach.first_name} {coach.last_name}
                              </option>
                            ))}
                          </Input>
                          {updatingId === schedule.id && (
                            <div className="mt-2 text-info">
                              <i className="fa fa-spinner fa-spin"></i> Actualizando...
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>
            ))}
        </Row>
      </div>
    </>
  );
};

export default AllSchedulesByDay;
